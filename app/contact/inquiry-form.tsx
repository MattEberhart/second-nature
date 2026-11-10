"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMUNICATIONS_CONSENT_TEXT, MARKETING_CONSENT_TEXT } from "@/lib/consent-copy";

type Interest = "gatherings" | "studio" | "both" | "";

export function InquiryForm({ defaultInterest }: { defaultInterest: string }) {
  const initialInterest: Interest = ["gatherings", "studio", "both"].includes(defaultInterest) ? (defaultInterest as Interest) : "";
  const [interest, setInterest] = useState<Interest>(initialInterest);
  const [form, setForm] = useState({ name: "", email: "", phone: "", eventDate: "", message: "", website: "", communicationsConsent: false, marketingConsent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!interest) { setError("Choose what you are interested in."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, interest }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your inquiry could not be sent.");
    } finally { setBusy(false); }
  }

  if (sent) return <section className="bg-limestone px-6 py-20 text-center md:px-16 md:py-28"><div className="mx-auto max-w-2xl"><h2 className="font-display text-3xl text-ink md:text-4xl">Thank you for reaching out.</h2><p className="mt-4 font-body text-ink/70">We&apos;ll be in touch soon.</p></div></section>;

  return (
    <section id="inquiry" className="bg-limestone px-6 pb-24 pt-6 md:px-16 md:pb-28 md:pt-8">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-card shadow-sm">
        <div className="p-6 sm:p-9 md:p-12">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Let&apos;s talk possibilities</h2>
          <p className="mt-3 font-body text-lg text-ink/70">Fill out the form below and we will get back to you within 48 hours.</p>
          {error ? <p role="alert" className="mt-6 rounded-xl bg-terracotta/15 p-4 text-sm text-ink">{error}</p> : null}
          <form onSubmit={submit} className="mt-8 space-y-6">
            <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
              <Label htmlFor="website">Website</Label>
              <Input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="phone">Phone</Label><PhoneInput id="phone" required value={form.phone} onValueChange={(phone) => setForm({ ...form, phone })} /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">What are you interested in?</Label>
              <Select value={interest} onValueChange={(value) => {
                const nextInterest = (value || "") as Interest;
                setInterest(nextInterest);
                if (nextInterest !== "gatherings") setForm({ ...form, eventDate: "" });
              }}><SelectTrigger id="interest" className="w-full" aria-required="true"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="gatherings">Event Rentals</SelectItem><SelectItem value="studio">Digital Consulting</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select>
            </div>
            {interest === "gatherings" ? <div className="space-y-2"><Label htmlFor="date">Event date</Label><Input id="date" type="date" required value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} /></div> : null}
            <div className="space-y-2"><Label htmlFor="message">Tell us more (optional)</Label><Textarea id="message" rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></div>
            <div className="space-y-4 border-t border-ink/10 pt-6">
              <ConsentCheckbox required checked={form.communicationsConsent} onChange={(checked) => setForm({ ...form, communicationsConsent: checked })} text={COMMUNICATIONS_CONSENT_TEXT} />
              <ConsentCheckbox checked={form.marketingConsent} onChange={(checked) => setForm({ ...form, marketingConsent: checked })} text={MARKETING_CONSENT_TEXT} />
              <p className="text-xs leading-5 text-ink/50">Marketing consent is optional and can be withdrawn at any time.</p>
            </div>
            <Button disabled={busy} type="submit" className="type-label h-12 w-full">{busy ? "Sending…" : "Send Inquiry"}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ConsentCheckbox({ checked, onChange, text, required = false }: { checked: boolean; onChange: (checked: boolean) => void; text: string; required?: boolean }) {
  return <label className="flex items-start gap-3 text-sm leading-6 text-ink/75"><input type="checkbox" required={required} checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 shrink-0 accent-fig" /><span>{text}{required ? " *" : ""}</span></label>;
}
