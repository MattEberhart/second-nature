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

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="bg-ink px-6 pb-12 pt-32 text-center text-limestone md:pt-40">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-olive">
          Contact
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">
          Let&apos;s make something memorable.
        </h1>
      </section>

      <section className="bg-limestone px-6 py-24">
        <div className="mx-auto max-w-xl">
          {sent ? (
            <div className="text-center">
              <h2 className="font-display text-2xl">Thank you for reaching out.</h2>
              <p className="mt-4 font-body text-ink/70">
                We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-6"
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
                <Select>
                  <SelectTrigger id="interest" className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gatherings">Gatherings</SelectItem>
                    <SelectItem value="studio">The Studio</SelectItem>
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
                className="h-12 w-full rounded-sm bg-ink font-display text-xs uppercase tracking-[0.25em] text-limestone hover:bg-ink/90"
              >
                Send Inquiry
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
