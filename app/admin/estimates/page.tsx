import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/estimator/money";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EstimatesPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin");
  const { data, error } = await getAdminSupabase()
    .from("estimates")
    .select("id,contact_id,customer_name,customer_email,event_date,venue_name,fulfillment,total_cents,status,resume_email_status,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(250);
  if (error) throw error;
  const estimates = data ?? [];

  return (
    <main className="min-h-screen bg-limestone px-6 py-12 text-ink md:px-16">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-xs uppercase tracking-[0.16em] text-fig">← Dashboard</Link>
        <div className="mt-4 border-b border-ink/10 pb-8">
          <h1 className="font-display text-5xl">Quotes</h1>
          <p className="mt-3 text-sm text-ink/55">Saved estimates retain their original item names and prices.</p>
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl bg-card">
          {estimates.length ? <div className="divide-y divide-ink/10">{estimates.map((estimate) => (
            <Link key={estimate.id} href={`/admin/estimates/${estimate.id}`} className="grid gap-4 p-5 transition hover:bg-secondary/60 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
              <div><p className="font-display text-xl">{estimate.customer_name}</p><p className="mt-1 text-xs text-ink/45">{estimate.customer_email}</p></div>
              <p className="text-sm text-ink/60">{estimate.event_date || "Date undecided"} · {estimate.venue_name || "Venue undecided"} · {estimate.fulfillment}</p>
              <div className="text-left md:text-right"><p className="font-display text-xl">{formatMoney(estimate.total_cents)}</p><p className="mt-1 text-[11px] capitalize text-ink/40">{estimate.status} · email {estimate.resume_email_status}</p></div>
            </Link>
          ))}</div> : <p className="p-10 text-center text-sm text-ink/50">No saved quotes yet.</p>}
        </div>
      </div>
    </main>
  );
}
