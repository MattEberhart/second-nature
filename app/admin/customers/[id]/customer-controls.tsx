"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const statuses = ["new", "contacted", "qualified", "booked", "closed"] as const;

export function CustomerControls({
  customerId,
  initialStatus,
}: {
  customerId: string;
  initialStatus: (typeof statuses)[number];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function updateStatus(nextStatus: (typeof statuses)[number]) {
    const previous = status;
    setStatus(nextStatus);
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Status could not be updated.");
      setNotice("Status updated.");
      router.refresh();
    } catch (error) {
      setStatus(previous);
      setNotice(error instanceof Error ? error.message : "Status could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function addNote(event: React.FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: note }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Note could not be added.");
      setNote("");
      setNotice("Note added.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Note could not be added.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl bg-card p-6">
      <div>
        <label htmlFor="customer-status" className="text-xs uppercase tracking-[0.16em] text-ink/50">
          Customer status
        </label>
        <select
          id="customer-status"
          value={status}
          disabled={busy}
          onChange={(event) => updateStatus(event.target.value as (typeof statuses)[number])}
          className="mt-2 h-11 w-full rounded-lg border border-ink/15 bg-limestone px-3 text-sm capitalize"
        >
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <form onSubmit={addNote}>
        <label htmlFor="customer-note" className="text-xs uppercase tracking-[0.16em] text-ink/50">
          Add an internal note
        </label>
        <Textarea
          id="customer-note"
          rows={5}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Conversation details, preferences, follow-up…"
          className="mt-2"
        />
        <Button type="submit" disabled={busy || !note.trim()} className="mt-3 bg-fig">
          {busy ? "Saving…" : "Add note"}
        </Button>
      </form>
      {notice ? <p className="text-sm text-ink/60" role="status">{notice}</p> : null}
    </div>
  );
}
