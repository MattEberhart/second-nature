"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Check, Video } from "lucide-react";
import type { AvailabilitySlot } from "@/lib/estimator/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlotPicker } from "@/components/booking/slot-picker";
import { COMMUNICATIONS_CONSENT_TEXT, MARKETING_CONSENT_TEXT } from "@/lib/consent-copy";

export function ConsultationForm() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotStart, setSlotStart] = useState("");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", eventDate: "", dateUndecided: false, venueName: "", notes: "", communicationsConsent: false, marketingConsent: false });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{ appointmentLabel: string; meetUrl: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/availability").then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setSlots(payload.slots);
    }).catch((reason) => setError(reason.message || "Availability could not be loaded."))
      .finally(() => setBusy(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!slotStart) { setError("Choose a consultation time."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/consultations/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...details, slotStart }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setConfirmation(payload);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The consultation could not be booked."); }
    finally { setBusy(false); }
  }

  if (confirmation) return <section className="flex min-h-[70vh] items-center bg-limestone px-6 py-20 text-center"><div className="mx-auto max-w-2xl"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-fig text-limestone"><Check /></div><p className="mt-7 text-xs uppercase tracking-[0.2em] text-fig">Consultation confirmed</p><h1 className="mt-3 font-display text-5xl">You’re on the Calendar!</h1><p className="mt-5 text-lg text-ink/65">We can’t wait to hear what you’re planning.</p><p className="mt-3 text-base leading-7 text-ink/65">Keep an eye on your inbox for your confirmation and Google Meet details. In the meantime, feel free to gather any inspiration you’d like to share.</p><div className="mt-8 rounded-2xl bg-card p-6 font-display text-2xl">{confirmation.appointmentLabel}</div>{confirmation.meetUrl ? <a href={confirmation.meetUrl} className="mt-7 inline-flex h-12 items-center rounded-lg bg-fig px-7 text-xs uppercase tracking-[0.17em] text-limestone">Join Google Meet</a> : null}<p className="mt-7 font-display text-2xl">See you soon!</p></div></section>;

  return <div className="min-h-screen bg-limestone px-6 py-14 text-ink md:px-16 md:py-20"><div className="mx-auto max-w-6xl"><div className="grid gap-8 lg:grid-cols-[1fr_330px] lg:items-end"><div><p className="text-xs uppercase tracking-[0.2em] text-fig">Complimentary · 30 minutes</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-none md:text-7xl">Schedule a Free Consultation</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-ink/65">Meet with us on Google Meet, share what you’re imagining, and leave with a clearer path forward.</p></div><div className="rounded-2xl bg-secondary p-6"><Video className="size-5 text-fig" /><p className="mt-3 font-display text-xl">Rather explore first?</p><Link href="/gatherings/estimate" className="mt-3 inline-block text-xs uppercase tracking-[0.17em] text-fig underline underline-offset-4">Build your estimate</Link></div></div>
    {error ? <div className="mt-7 rounded-xl bg-terracotta/15 p-4 text-sm">{error}</div> : null}
    <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[420px_1fr]"><div className="space-y-5 rounded-2xl bg-card p-6 md:p-8"><CalendarDays className="size-5 text-fig" /><h2 className="font-display text-3xl text-aegean">Tell us a little</h2><div><Label>Name</Label><Input required autoComplete="name" className="mt-2" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} /></div><div><Label>Email</Label><Input required type="email" autoComplete="email" className="mt-2" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} /></div><div><Label>Phone</Label><Input required type="tel" autoComplete="tel" className="mt-2" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} /></div><div><Label>Event date</Label><Input required={!details.dateUndecided} disabled={details.dateUndecided} type="date" className="mt-2" value={details.eventDate} onChange={(e) => setDetails({ ...details, eventDate: e.target.value })} /><label className="mt-2 flex gap-2 text-xs text-ink/60"><input type="checkbox" checked={details.dateUndecided} onChange={(e) => setDetails({ ...details, dateUndecided: e.target.checked, eventDate: e.target.checked ? "" : details.eventDate })} /> Not sure yet</label></div><div><Label>Venue name</Label><Input placeholder="Optional" className="mt-2" value={details.venueName} onChange={(e) => setDetails({ ...details, venueName: e.target.value })} /></div><div><Label>Anything we should know?</Label><Textarea rows={5} className="mt-2" value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} /></div><div className="space-y-4 border-t border-ink/10 pt-5"><ConsentCheckbox required checked={details.communicationsConsent} onChange={(checked) => setDetails({ ...details, communicationsConsent: checked })} text={COMMUNICATIONS_CONSENT_TEXT} /><ConsentCheckbox checked={details.marketingConsent} onChange={(checked) => setDetails({ ...details, marketingConsent: checked })} text={MARKETING_CONSENT_TEXT} /><p className="text-xs leading-5 text-ink/50">Marketing consent is optional and can be withdrawn at any time.</p></div></div><div><h2 className="font-display text-3xl text-aegean">Choose a time</h2><SlotPicker slots={slots} selected={slotStart} onSelect={setSlotStart} loading={busy} empty={<p className="mt-5 rounded-xl bg-secondary p-6 text-sm text-ink/65">No open times are showing right now. Please check back soon or reach out through the contact page.</p>} /><Button type="submit" disabled={busy || !slotStart} className="mt-8 h-12 bg-fig px-8 text-xs uppercase tracking-[0.17em]">{busy ? "Booking…" : "Book my Google Meet"}</Button><p className="mt-4 text-xs leading-5 text-ink/50">Our calendar details stay private. You’ll receive a Google Meet invitation at the email above.</p></div></form>
  </div></div>;
}

function ConsentCheckbox({ checked, onChange, text, required = false }: { checked: boolean; onChange: (checked: boolean) => void; text: string; required?: boolean }) {
  return <label className="flex items-start gap-3 text-sm leading-6 text-ink/75"><input type="checkbox" required={required} checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 shrink-0 accent-fig" /><span>{text}{required ? " *" : ""}</span></label>;
}
