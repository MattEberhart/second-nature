import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Mail, Phone } from "lucide-react";
import { getAdminUser } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/estimator/money";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { CustomerControls } from "./customer-controls";

export const dynamic = "force-dynamic";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin");
  const { id } = await params;
  const supabase = getAdminSupabase();
  const [contactResult, inquiriesResult, estimatesResult, appointmentsResult, notesResult, activitiesResult] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).maybeSingle(),
    supabase.from("contact_inquiries").select("*").eq("contact_id", id).order("created_at", { ascending: false }),
    supabase.from("estimates").select("id,event_date,venue_name,fulfillment,total_cents,status,resume_email_status,created_at,updated_at").eq("contact_id", id).order("created_at", { ascending: false }),
    supabase.from("appointments").select("id,estimate_id,starts_at,status,google_meet_url,created_at").eq("contact_id", id).order("starts_at", { ascending: false }),
    supabase.from("contact_notes").select("*").eq("contact_id", id).order("created_at", { ascending: false }),
    supabase.from("contact_activities").select("*").eq("contact_id", id).order("created_at", { ascending: false }).limit(100),
  ]);
  if (contactResult.error) throw contactResult.error;
  for (const result of [inquiriesResult, estimatesResult, appointmentsResult, notesResult, activitiesResult]) {
    if (result.error) throw result.error;
  }
  if (!contactResult.data) notFound();
  const contact = contactResult.data;
  const inquiries = inquiriesResult.data ?? [];
  const estimates = estimatesResult.data ?? [];
  const appointments = appointmentsResult.data ?? [];
  const notes = notesResult.data ?? [];
  const activities = activitiesResult.data ?? [];

  return (
    <main className="min-h-screen bg-limestone px-6 py-12 text-ink md:px-16">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin/customers" className="text-xs uppercase tracking-[0.16em] text-fig">← Customers</Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-fig">Customer profile</p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl">{contact.name}</h1>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-ink/60">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-fig"><Mail className="size-4" />{contact.email}</a>
              {contact.phone ? <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-fig"><Phone className="size-4" />{contact.phone}</a> : null}
            </div>

            <section className="mt-10 rounded-2xl bg-card p-6">
              <h2 className="font-display text-3xl">Inquiries</h2>
              <div className="mt-5 space-y-4">
                {inquiries.length ? inquiries.map((inquiry) => (
                  <article key={inquiry.id} className="rounded-xl border border-ink/10 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="font-display text-xl capitalize">{inquiry.interest}</p><p className="mt-1 text-xs text-ink/45">{formatDateTime(inquiry.created_at)}</p></div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{inquiry.status}</span>
                    </div>
                    {inquiry.event_date ? <p className="mt-3 text-sm"><strong>Event:</strong> {inquiry.event_date}</p> : null}
                    {inquiry.message ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/65">{inquiry.message}</p> : null}
                    <p className="mt-3 text-xs text-ink/40">Lydia email: {inquiry.owner_email_status} · Customer email: {inquiry.customer_email_status}</p>
                  </article>
                )) : <Empty text="No direct inquiries yet." />}
              </div>
            </section>

            <section className="mt-8 rounded-2xl bg-card p-6">
              <div className="flex items-end justify-between gap-4"><h2 className="font-display text-3xl">Quotes</h2><Link href="/admin/estimates" className="text-xs text-fig underline underline-offset-4">View all</Link></div>
              <div className="mt-5 space-y-3">
                {estimates.length ? estimates.map((estimate) => (
                  <Link key={estimate.id} href={`/admin/estimates/${estimate.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 p-4 transition hover:bg-secondary/60">
                    <div><p className="font-display text-xl">{estimate.venue_name || "Starting estimate"}</p><p className="mt-1 text-xs text-ink/45">{estimate.event_date || "Date undecided"} · {estimate.fulfillment} · {estimate.status}</p></div>
                    <div className="text-right"><p className="font-display text-xl">{formatMoney(estimate.total_cents)}</p><p className="mt-1 text-[11px] text-ink/40">Email {estimate.resume_email_status}</p></div>
                  </Link>
                )) : <Empty text="No saved quotes yet." />}
              </div>
            </section>

            <section className="mt-8 rounded-2xl bg-card p-6">
              <h2 className="font-display text-3xl">Appointments</h2>
              <div className="mt-5 space-y-3">
                {appointments.length ? appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 p-4">
                    <div className="flex items-center gap-3"><CalendarDays className="size-4 text-fig" /><div><p className="font-display text-lg">{formatDateTime(appointment.starts_at)}</p><p className="mt-1 text-xs capitalize text-ink/45">{appointment.status}</p></div></div>
                    {appointment.google_meet_url ? <a href={appointment.google_meet_url} className="text-xs text-fig underline underline-offset-4">Open Meet</a> : null}
                  </div>
                )) : <Empty text="No appointments yet." />}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <CustomerControls customerId={contact.id} initialStatus={contact.status} />
            <section className="rounded-2xl bg-card p-6">
              <h2 className="font-display text-2xl">Internal notes</h2>
              <div className="mt-4 space-y-4">
                {notes.length ? notes.map((note) => (
                  <div key={note.id} className="border-b border-ink/10 pb-4 last:border-0 last:pb-0">
                    <p className="whitespace-pre-wrap text-sm leading-6">{note.body}</p>
                    <p className="mt-2 text-[11px] text-ink/40">{note.author_email} · {formatDateTime(note.created_at)}</p>
                  </div>
                )) : <Empty text="No notes yet." />}
              </div>
            </section>
            <section className="rounded-2xl bg-card p-6">
              <h2 className="font-display text-2xl">Activity</h2>
              <div className="mt-4 space-y-4">
                {activities.length ? activities.map((activity) => (
                  <div key={activity.id} className="border-l border-olive/40 pl-4">
                    <p className="text-sm">{activity.summary}</p>
                    <p className="mt-1 text-[11px] text-ink/40">{formatDateTime(activity.created_at)}</p>
                  </div>
                )) : <Empty text="No activity yet." />}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Empty({ text }: { text: string }) { return <p className="rounded-xl bg-secondary p-4 text-sm text-ink/50">{text}</p>; }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
