"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function InquiryForm({ defaultInterest }: { defaultInterest: string }) {
  const [interest, setInterest] = useState(defaultInterest);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <section className="min-h-screen bg-limestone px-6 py-32 text-center md:px-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Thank you for reaching out.
          </h2>
          <p className="mt-4 font-body text-ink/70">
            We&apos;ll be in touch soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="inquiry" className="bg-limestone px-6 py-24 md:px-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-3xl text-ink md:text-4xl">
          Let&apos;s talk possibilities
        </h2>
        <p className="mt-3 font-body text-lg text-ink/70">
          Fill out the form below and we will get back to you within 48 hours.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-10 space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest">What are you interested in?</Label>
            <Select value={interest} onValueChange={(value) => setInterest(value || "")}>
              <SelectTrigger id="interest" className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gatherings">Event Rentals</SelectItem>
                <SelectItem value="studio">Digital Consulting</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Event or launch date</Label>
            <Input id="date" placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Tell us more</Label>
            <Textarea id="message" rows={5} required />
          </div>

          <Button
            type="submit"
            className="h-12 w-full font-display text-xs uppercase tracking-[0.2em]"
          >
            Send Inquiry
          </Button>
        </form>
      </div>
    </section>
  );
}
