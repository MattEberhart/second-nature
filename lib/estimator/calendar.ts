import "server-only";
import { createHash } from "node:crypto";
import { decryptSecret } from "@/lib/security";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";
import { defaultAvailability, getSetting } from "./settings";
import type { AvailabilitySlot } from "./types";

type BusyPeriod = { start: string; end: string };

export const SLOT_TAKEN_MESSAGE = "That time was just taken. Please choose another.";

/** Thrown when an appointment insert hits unique (starts_at, ends_at). */
export class SlotTakenError extends Error {
  status = 409;

  constructor() {
    super(SLOT_TAKEN_MESSAGE);
  }
}

/** Postgres unique_violation on the appointment time slot. */
export function isSlotConflict(error: { code?: string; message?: string } | null) {
  return error?.code === "23505" && (error.message ?? "").includes("starts_at");
}

function partsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function zonedToUtc(dateText: string, timeText: string, timeZone: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  const [hour, minute] = timeText.split(":").map(Number);
  let guess = Date.UTC(year, month - 1, day, hour, minute);
  for (let index = 0; index < 2; index += 1) {
    const rendered = partsInZone(new Date(guess), timeZone);
    const renderedUtc = Date.UTC(
      Number(rendered.year),
      Number(rendered.month) - 1,
      Number(rendered.day),
      Number(rendered.hour),
      Number(rendered.minute),
    );
    guess += Date.UTC(year, month - 1, day, hour, minute) - renderedUtc;
  }
  return new Date(guess);
}

function dateKeyInZone(date: Date, timeZone: string) {
  const p = partsInZone(date, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

async function googleAccessToken() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await getAdminSupabase()
    .from("oauth_connections")
    .select("encrypted_refresh_token")
    .eq("provider", "google")
    .maybeSingle();
  if (!data) return null;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: decryptSecret(data.encrypted_refresh_token),
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Google Calendar authorization needs attention.");
  return ((await response.json()) as { access_token: string }).access_token;
}

async function googleBusy(timeMin: string, timeMax: string, calendarIds: string[]) {
  const accessToken = await googleAccessToken();
  if (!accessToken) return [] as BusyPeriod[];
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, timeZone: "America/New_York", items: calendarIds.map((id) => ({ id })) }),
  });
  if (!response.ok) throw new Error("Could not read Lydia’s calendar availability.");
  const payload = (await response.json()) as { calendars?: Record<string, { busy?: BusyPeriod[] }> };
  return Object.values(payload.calendars ?? {}).flatMap((calendar) => calendar.busy ?? []);
}

export async function listAvailability() {
  const settings = await getSetting("availability", defaultAvailability);
  const now = new Date();
  const earliest = new Date(now.getTime() + settings.minimumNoticeHours * 60 * 60 * 1000);
  const horizon = new Date(now.getTime() + settings.bookingHorizonDays * 24 * 60 * 60 * 1000);
  const googlePeriods = await googleBusy(now.toISOString(), horizon.toISOString(), settings.busyCalendarIds);

  const { data: appointments } = isSupabaseConfigured()
    ? await getAdminSupabase()
        .from("appointments")
        .select("starts_at,ends_at")
        .neq("status", "cancelled")
        .gte("ends_at", now.toISOString())
        .lte("starts_at", horizon.toISOString())
    : { data: [] };
  const busy = [
    ...googlePeriods,
    ...(appointments ?? []).map((item) => ({ start: item.starts_at, end: item.ends_at })),
  ];

  const slots: AvailabilitySlot[] = [];
  for (let offset = 0; offset <= settings.bookingHorizonDays; offset += 1) {
    const cursor = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const dateKey = dateKeyInZone(cursor, settings.timeZone);
    const midday = zonedToUtc(dateKey, "12:00", settings.timeZone);
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: settings.timeZone,
      weekday: "short",
    }).format(midday);
    const dayOfWeek = String(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday));
    const windows = settings.weekly[dayOfWeek] ?? [];
    for (const [windowStart, windowEnd] of windows) {
      let start = zonedToUtc(dateKey, windowStart, settings.timeZone);
      const endOfWindow = zonedToUtc(dateKey, windowEnd, settings.timeZone);
      while (start.getTime() + settings.durationMinutes * 60000 <= endOfWindow.getTime()) {
        const end = new Date(start.getTime() + settings.durationMinutes * 60000);
        const bufferedStart = new Date(start.getTime() - settings.bufferMinutes * 60000);
        const bufferedEnd = new Date(end.getTime() + settings.bufferMinutes * 60000);
        const overlaps = busy.some((period) =>
          bufferedStart < new Date(period.end) && bufferedEnd > new Date(period.start),
        );
        if (start >= earliest && !overlaps) slots.push({ start: start.toISOString(), end: end.toISOString() });
        start = new Date(start.getTime() + (settings.durationMinutes + settings.bufferMinutes) * 60000);
      }
    }
  }
  return slots;
}

export async function createCalendarMeeting(input: {
  appointmentId: string;
  customerName: string;
  customerEmail: string;
  startsAt: string;
  endsAt: string;
  description: string;
}) {
  const accessToken = await googleAccessToken();
  if (!accessToken) throw new Error("Lydia’s Google Calendar is not connected yet.");
  const calendarId = process.env.GOOGLE_BOOKING_CALENDAR_ID || "primary";
  const eventId = `sn${createHash("sha256").update(input.appointmentId).digest("hex").slice(0, 28)}`;
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: eventId,
        summary: `Second Nature consultation with ${input.customerName}`,
        description: input.description,
        start: { dateTime: input.startsAt, timeZone: "America/New_York" },
        end: { dateTime: input.endsAt, timeZone: "America/New_York" },
        attendees: [{ email: input.customerEmail }],
        conferenceData: {
          createRequest: {
            requestId: input.appointmentId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );
  if (!response.ok) throw new Error("Could not create the Google Calendar meeting.");
  const event = (await response.json()) as {
    id: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: Array<{ entryPointType: string; uri: string }> };
  };
  return {
    eventId: event.id,
    meetUrl:
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find((point) => point.entryPointType === "video")?.uri ||
      null,
  };
}
