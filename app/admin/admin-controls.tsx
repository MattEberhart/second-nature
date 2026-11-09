"use client";

import { useState } from "react";
import { Check, ChevronDown, Save, SlidersHorizontal } from "lucide-react";
import type { AvailabilitySettings, DeliverySettings } from "@/lib/estimator/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminControls({ availability: initialAvailability, delivery: initialDelivery, calendarEmail, calendarOwnerEmail, canConnectCalendar }: { availability: AvailabilitySettings; delivery: DeliverySettings; calendarEmail: string | null; calendarOwnerEmail: string; canConnectCalendar: boolean }) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [delivery, setDelivery] = useState(initialDelivery);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveSettings() { setBusy(true); const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availability, delivery }) }); const payload = await response.json(); setBusy(false); setNotice(response.ok ? "Settings saved." : payload.error); }

  return (
    <div className="mt-10 space-y-8">
      {notice ? (
        <button onClick={() => setNotice("")} className="flex w-full items-center gap-2 rounded-xl bg-olive/15 p-4 text-left text-sm">
          <Check className="size-4" />
          {notice}
        </button>
      ) : null}

      <details className="group overflow-hidden rounded-2xl border border-ink/10 bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 marker:hidden">
          <div className="flex items-center gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-fig">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-2xl">Advanced settings</h2>
              <p className="mt-1 text-sm text-ink/50">Meeting rules and delivery fee calculations</p>
            </div>
          </div>
          <ChevronDown className="size-5 shrink-0 text-ink/45 transition-transform group-open:rotate-180" />
        </summary>

        <div className="space-y-8 border-t border-ink/10 p-6">
          <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-fig">Calendar</p>
              <h3 className="mt-2 font-display text-3xl">Meeting rules</h3>
              <p className="mt-3 text-sm leading-6 text-ink/55">
                {calendarEmail ? `Connected as ${calendarEmail}` : `Not connected. Only ${calendarOwnerEmail || "the calendar owner"} can connect Google Calendar.`}
              </p>
              {canConnectCalendar ? (
                <a href="/api/admin/calendar/connect" className="mt-4 inline-flex h-10 items-center rounded-lg border border-ink/15 px-4 text-xs uppercase tracking-[0.15em]">
                  {calendarEmail ? "Reconnect calendar" : "Connect calendar"}
                </a>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Meeting minutes" value={availability.durationMinutes} onChange={(value) => setAvailability({ ...availability, durationMinutes: value })} />
              <NumberField label="Buffer minutes" value={availability.bufferMinutes} onChange={(value) => setAvailability({ ...availability, bufferMinutes: value })} />
              <NumberField label="Minimum notice (hours)" value={availability.minimumNoticeHours} onChange={(value) => setAvailability({ ...availability, minimumNoticeHours: value })} />
              <NumberField label="Booking horizon (days)" value={availability.bookingHorizonDays} onChange={(value) => setAvailability({ ...availability, bookingHorizonDays: value })} />
              <div className="sm:col-span-2">
                <Label>Busy calendar IDs</Label>
                <Input className="mt-2" value={availability.busyCalendarIds.join(", ")} onChange={(e) => setAvailability({ ...availability, busyCalendarIds: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} />
                <p className="mt-2 text-xs text-ink/45">Use primary plus the shared personal calendar’s email or calendar ID.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-t border-ink/10 pt-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-fig">Delivery</p>
              <h3 className="mt-2 font-display text-3xl">Fee calculations</h3>
              <p className="mt-3 text-sm leading-6 text-ink/55">Mileage is calculated round trip from the private origin.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <MoneyField label="Base delivery" cents={delivery.baseFeeCents} onChange={(value) => setDelivery({ ...delivery, baseFeeCents: value })} />
              <MoneyField label="Per round-trip mile" cents={delivery.roundTripPerMileCents} onChange={(value) => setDelivery({ ...delivery, roundTripPerMileCents: value })} />
              <MoneyField label="Full service starts at" cents={delivery.fullServiceStartingFeeCents} onChange={(value) => setDelivery({ ...delivery, fullServiceStartingFeeCents: value })} />
            </div>
          </section>

          <div className="flex justify-end border-t border-ink/10 pt-6">
            <Button disabled={busy} onClick={saveSettings} className="bg-fig">
              <Save className="size-4" /> Save advanced settings
            </Button>
          </div>
        </div>
      </details>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <div><Label>{label}</Label><Input type="number" min={0} className="mt-2" value={value} onChange={(e) => onChange(Number(e.target.value))} /></div>; }
function MoneyField({ label, cents, onChange }: { label: string; cents: number; onChange: (value: number) => void }) { return <div><Label>{label}</Label><div className="relative mt-2"><span className="absolute left-3 top-2.5 text-sm text-ink/45">$</span><Input type="number" min={0} step="0.01" className="pl-7" value={(cents / 100).toFixed(2)} onChange={(e) => onChange(Math.round(Number(e.target.value) * 100))} /></div></div>; }
