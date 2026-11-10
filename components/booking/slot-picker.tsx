"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import type { AvailabilitySlot } from "@/lib/estimator/types";
import { cn } from "@/lib/utils";

const TIME_ZONE = "America/New_York";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFormat = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });

/** YYYY-MM-DD in Charlotte time. */
function dayKey(date: Date) {
  return dayKeyFormat.format(date);
}

/** Calendar math runs on UTC dates built from Eastern day keys, so the grid never shifts with the viewer's zone. */
function keyToUtc(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function utcToKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthIndex(key: string) {
  const [year, month] = key.split("-").map(Number);
  return year * 12 + (month - 1);
}

export function SlotPicker({
  slots,
  selected,
  onSelect,
  loading = false,
  empty,
}: {
  slots: AvailabilitySlot[];
  selected: string;
  onSelect: (start: string) => void;
  loading?: boolean;
  empty?: React.ReactNode;
}) {
  const byDay = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const key = dayKey(new Date(slot.start));
      map.set(key, [...(map.get(key) || []), slot]);
    }
    return map;
  }, [slots]);
  const availableDays = useMemo(() => [...byDay.keys()].sort(), [byDay]);
  const todayKey = dayKey(new Date());
  const firstDay = availableDays[0] ?? todayKey;
  const minMonth = monthIndex(todayKey);
  const maxMonth = Math.max(minMonth, monthIndex(availableDays.at(-1) ?? todayKey));

  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedMonth, setPickedMonth] = useState<number | null>(null);
  const selectedDay = selected ? dayKey(new Date(selected)) : null;
  const activeDay = pickedDay ?? selectedDay ?? firstDay;
  const viewMonth = pickedMonth ?? monthIndex(activeDay);

  if (loading && !slots.length) return <p className="mt-6 text-sm text-ink/55">Finding open times…</p>;
  if (!slots.length) return <>{empty}</>;

  const year = Math.floor(viewMonth / 12);
  const month = viewMonth % 12;
  const leadingBlanks = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<string | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => utcToKey(new Date(Date.UTC(year, month, i + 1)))),
  ];
  const monthLabel = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month, 1)));
  const daySlots = byDay.get(activeDay) ?? [];
  const activeLabel = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(keyToUtc(activeDay));

  function pickDay(key: string) {
    setPickedDay(key);
    if (selected && dayKey(new Date(selected)) !== key) onSelect("");
  }

  function changeMonth(delta: number) {
    const next = viewMonth + delta;
    setPickedMonth(next);
    const firstInMonth = availableDays.find((key) => monthIndex(key) === next);
    if (firstInMonth) pickDay(firstInMonth);
  }

  return (
    <div className="@container mt-6">
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-card @2xl:grid @2xl:grid-cols-[minmax(0,1fr)_220px]">
      <div className="p-4 @md:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="whitespace-nowrap font-display text-xl text-ink @md:text-2xl">{monthLabel}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => changeMonth(-1)} disabled={viewMonth <= minMonth} aria-label="Previous month" className="flex size-9 items-center justify-center rounded-full text-ink/70 transition hover:bg-secondary disabled:pointer-events-none disabled:opacity-25">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => changeMonth(1)} disabled={viewMonth >= maxMonth} aria-label="Next month" className="flex size-9 items-center justify-center rounded-full text-ink/70 transition hover:bg-secondary disabled:pointer-events-none disabled:opacity-25">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="pb-2 text-xs uppercase tracking-wide text-ink/45">{weekday}</span>
          ))}
          {cells.map((key, index) => {
            if (!key) return <span key={`blank-${index}`} />;
            const available = byDay.has(key);
            const isActive = key === activeDay;
            return (
              <div key={key} className="flex justify-center">
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => pickDay(key)}
                  aria-pressed={isActive}
                  aria-label={new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(keyToUtc(key)) + (available ? "" : ", unavailable")}
                  className={cn(
                    "relative flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-sm transition",
                    available ? "font-semibold text-aegean" : "text-ink/30",
                    available && !isActive && "bg-aegean/10 hover:bg-aegean/20",
                    isActive && "bg-aegean text-white",
                  )}
                >
                  {Number(key.slice(8))}
                  {key === todayKey ? <span className={cn("absolute bottom-1.5 h-0.5 w-3 rounded-full", isActive ? "bg-white" : "bg-fig")} /> : null}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-ink/55">
          <Globe className="size-3.5" /> Times shown in Eastern Time (Charlotte, NC)
        </p>
      </div>
      <div className="border-t border-ink/10 p-4 @md:p-6 @2xl:border-l @2xl:border-t-0">
        <p className="text-xs italic text-ink/55">Available times on</p>
        <p className="font-display text-xl text-ink">{activeLabel}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 @md:grid-cols-3 @2xl:max-h-[340px] @2xl:grid-cols-1 @2xl:overflow-y-auto @2xl:pr-1">
          {daySlots.map((slot) => (
            <button
              type="button"
              key={slot.start}
              onClick={() => onSelect(slot.start)}
              aria-pressed={selected === slot.start}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-semibold transition",
                selected === slot.start ? "border-aegean bg-aegean text-white" : "border-aegean/35 text-aegean hover:border-aegean hover:bg-aegean/5",
              )}
            >
              {timeFormat.format(new Date(slot.start))}
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
