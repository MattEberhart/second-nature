import "server-only";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";

export type AvailabilitySettings = {
  timeZone: string;
  durationMinutes: number;
  bufferMinutes: number;
  minimumNoticeHours: number;
  bookingHorizonDays: number;
  weekly: Record<string, [string, string][]>;
  busyCalendarIds: string[];
};

export type DeliverySettings = {
  baseFeeCents: number;
  roundTripPerMileCents: number;
  fullServiceStartingFeeCents: number;
};

export const defaultAvailability: AvailabilitySettings = {
  timeZone: "America/New_York",
  durationMinutes: 30,
  bufferMinutes: 15,
  minimumNoticeHours: 24,
  bookingHorizonDays: 60,
  weekly: {
    "1": [["10:00", "16:00"]],
    "2": [["10:00", "16:00"]],
    "3": [["10:00", "16:00"]],
    "4": [["10:00", "16:00"]],
    "5": [["10:00", "14:00"]],
  },
  busyCalendarIds: ["primary"],
};

export const defaultDelivery: DeliverySettings = {
  baseFeeCents: 7500,
  roundTripPerMileCents: 200,
  fullServiceStartingFeeCents: 25000,
};

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  const { data, error } = await getAdminSupabase()
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return data.value as T;
}

export async function setSetting(key: string, value: unknown) {
  const { error } = await getAdminSupabase()
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
