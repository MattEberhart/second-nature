import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/estimator/money";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { formatPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export default async function EstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin");
  const { id } = await params;
  const { data: estimate, error } = await getAdminSupabase()
    .from("estimates")
    .select("*,estimate_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!estimate) notFound();
  const items = [...(estimate.estimate_items ?? [])].sort((a, b) =>
    a.public_name_snapshot.localeCompare(b.public_name_snapshot),
  );

  return (
    <main className="min-h-screen bg-limestone px-6 py-12 text-ink md:px-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/estimates" className="text-xs uppercase tracking-[0.16em] text-fig">← Quotes</Link>
        <div className="mt-5 flex flex-col justify-between gap-5 border-b border-ink/10 pb-8 md:flex-row md:items-end">
          <div><p className="text-xs uppercase tracking-[0.2em] text-fig">{estimate.status}</p><h1 className="mt-3 font-display text-5xl">{estimate.customer_name}</h1><p className="mt-3 text-sm text-ink/55">Saved {formatDateTime(estimate.created_at)} · Updated {formatDateTime(estimate.updated_at)}</p></div>
          {estimate.contact_id ? <Link href={`/admin/customers/${estimate.contact_id}`} className="inline-flex h-10 items-center rounded-lg bg-fig px-5 text-xs uppercase tracking-[0.14em] text-limestone">View customer</Link> : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl bg-card p-6">
            <h2 className="font-display text-3xl">Quote items</h2>
            <div className="mt-5 divide-y divide-ink/10">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4 first:pt-0">
                  <div><p className="font-display text-lg">{item.public_name_snapshot}</p><p className="mt-1 text-xs text-ink/45">{item.variant_label_snapshot} · {item.quantity} × {formatMoney(item.unit_price_cents_snapshot)}</p></div>
                  <p className="font-display text-lg">{formatMoney(item.line_total_cents)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm">
              <MoneyRow label="Rentals" cents={estimate.subtotal_cents} />
              <MoneyRow label="Delivery" cents={estimate.delivery_fee_cents} />
              <MoneyRow label="Full service" cents={estimate.full_service_fee_cents} />
              <div className="flex justify-between pt-2 font-display text-2xl"><span>Total</span><span>{formatMoney(estimate.total_cents)}</span></div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-card p-6"><h2 className="font-display text-2xl">Customer</h2><dl className="mt-4 space-y-4 text-sm"><Detail label="Email" value={estimate.customer_email} /><Detail label="Phone" value={formatPhone(estimate.customer_phone) || "Not provided"} /><Detail label="Event date" value={estimate.event_date || "Undecided"} /><Detail label="Guest count" value={estimate.guest_count ? String(estimate.guest_count) : "Not provided"} /></dl></section>
            <section className="rounded-2xl bg-card p-6"><h2 className="font-display text-2xl">Event</h2><dl className="mt-4 space-y-4 text-sm"><Detail label="Venue" value={estimate.venue_name || "Not provided"} /><Detail label="Address" value={estimate.venue_address || "Not provided"} /><Detail label="Fulfillment" value={estimate.fulfillment} /><Detail label="Resume email" value={estimate.resume_email_status} /></dl>{estimate.notes ? <p className="mt-5 whitespace-pre-wrap border-t border-ink/10 pt-5 text-sm leading-6 text-ink/65">{estimate.notes}</p> : null}</section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MoneyRow({ label, cents }: { label: string; cents: number }) { if (!cents) return null; return <div className="flex justify-between"><span>{label}</span><span>{formatMoney(cents)}</span></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs uppercase tracking-[0.12em] text-ink/40">{label}</dt><dd className="mt-1 capitalize text-ink/70">{value}</dd></div>; }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
