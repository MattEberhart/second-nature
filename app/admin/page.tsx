import Link from "next/link";
import { CalendarDays, ExternalLink, PackageOpen, ScrollText, Users } from "lucide-react";
import { getAdminUser, getCalendarOwnerEmail, isCalendarOwnerEmail } from "@/lib/admin-auth";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";
import { defaultAvailability, defaultDelivery, getSetting } from "@/lib/estimator/settings";
import { formatMoney } from "@/lib/estimator/money";
import { AdminControls } from "./admin-controls";
import { CatalogManager } from "./catalog-manager";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  if (!isSupabaseConfigured()) return <AdminSetup message="Connect Supabase and run the included migration before opening Lydia’s dashboard." />;
  const user = await getAdminUser();
  if (!user) return <AdminLogin error={params.error} />;

  const supabase = getAdminSupabase();
  const [estimatesResult, appointmentsResult, productsResult, collectionsResult, contactsResult, inquiriesResult, availability, delivery, connectionResult] = await Promise.all([
    supabase.from("estimates").select("id,customer_name,customer_email,event_date,venue_name,fulfillment,total_cents,status,created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("appointments").select("id,customer_name,customer_email,starts_at,status,google_meet_url,estimate_id").order("starts_at", { ascending: true }).gte("starts_at", new Date().toISOString()).limit(50),
    supabase.from("catalog_products").select("id,public_name,category,material,description,image_path,accent,price_prefix,active,catalog_variants(id,label,size,color,image_path,unit_price_cents,active,sort_order)").order("sort_order"),
    supabase.from("curated_collections").select("id,name,slug,description,header_image_path,active,curated_collection_members(product_id,variant_id),curated_collection_images(id,image_path,alt_text,sort_order)").order("sort_order"),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("contact_inquiries").select("id,contact_id,name,email,interest,event_date,status,owner_email_status,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    getSetting("availability", defaultAvailability),
    getSetting("delivery", defaultDelivery),
    supabase.from("oauth_connections").select("account_email,updated_at").eq("provider", "google").maybeSingle(),
  ]);
  const estimates = estimatesResult.data ?? [];
  const appointments = appointmentsResult.data ?? [];
  const products = productsResult.data ?? [];
  const collections = collectionsResult.data ?? [];
  const inquiries = inquiriesResult.data ?? [];
  const calendarOwnerEmail = getCalendarOwnerEmail();

  return <div className="min-h-screen bg-limestone px-6 py-12 text-ink md:px-16"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 border-b border-ink/10 pb-8 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[0.2em] text-fig">Private workspace</p><h1 className="mt-3 font-display text-5xl">Lydia’s Dashboard</h1><p className="mt-3 text-sm text-ink/55">Signed in as {user.email}</p></div><div className="flex flex-wrap gap-3"><Link href="/admin/customers" className="inline-flex h-10 items-center rounded-lg border border-ink/15 px-4 text-xs uppercase tracking-[0.15em]">Customers</Link><Link href="/admin/estimates" className="inline-flex h-10 items-center rounded-lg border border-ink/15 px-4 text-xs uppercase tracking-[0.15em]">Quotes</Link><Link href="/gatherings/estimate" className="inline-flex h-10 items-center rounded-lg border border-ink/15 px-4 text-xs uppercase tracking-[0.15em]">View estimator</Link><form action="/api/admin/auth/logout" method="post"><button className="h-10 rounded-lg bg-ink px-4 text-xs uppercase tracking-[0.15em] text-limestone">Sign out</button></form></div></div>
    {params.error ? <p className="mt-6 rounded-xl bg-terracotta/15 p-4 text-sm">{params.error}</p> : null}
    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={<Users />} label="Customers" value={String(contactsResult.count ?? 0)} /><Stat icon={<CalendarDays />} label="Upcoming calls" value={String(appointments.length)} /><Stat icon={<ScrollText />} label="Saved quotes" value={String(estimates.length)} /><Stat icon={<PackageOpen />} label="Published collections" value={String(collections.filter((collection) => collection.active).length)} /></div>
    <section className="mt-10 rounded-2xl bg-card p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-fig">Inbox</p><h2 className="mt-2 font-display text-3xl">Recent inquiries</h2></div><Link href="/admin/customers" className="text-xs text-fig underline underline-offset-4">All customers</Link></div><div className="mt-5 grid gap-3 md:grid-cols-2">{inquiries.length ? inquiries.map((inquiry) => <Link key={inquiry.id} href={`/admin/customers/${inquiry.contact_id}`} className="rounded-xl border border-ink/10 p-4 transition hover:bg-secondary/60"><div className="flex items-start justify-between gap-3"><div><p className="font-display text-lg">{inquiry.name}</p><p className="mt-1 text-xs text-ink/45">{inquiry.email}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-[11px] capitalize">{inquiry.status}</span></div><p className="mt-3 text-sm capitalize text-ink/60">{inquiry.interest}{inquiry.event_date ? ` · ${inquiry.event_date}` : ""}</p><p className="mt-2 text-[11px] text-ink/40">Lydia email: {inquiry.owner_email_status}</p></Link>) : <Empty copy="No inquiries yet." />}</div></section>
    <div className="mt-10"><CatalogManager items={products} collections={collections} /></div>
    <AdminControls availability={availability} delivery={delivery} calendarEmail={connectionResult.data?.account_email || null} calendarOwnerEmail={calendarOwnerEmail} canConnectCalendar={isCalendarOwnerEmail(user.email)} />
    <div className="mt-10 grid gap-8 xl:grid-cols-2"><section className="rounded-2xl bg-card p-6"><h2 className="font-display text-3xl">Upcoming consultations</h2><div className="mt-5 space-y-3">{appointments.length ? appointments.map((appointment) => <div key={appointment.id} className="rounded-xl border border-ink/10 p-4"><div className="flex justify-between gap-3"><div><p className="font-display text-lg">{appointment.customer_name}</p><p className="mt-1 text-xs text-ink/55">{new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(appointment.starts_at))}</p></div>{appointment.google_meet_url ? <a href={appointment.google_meet_url} className="text-fig"><ExternalLink className="size-4" /></a> : null}</div></div>) : <Empty copy="No consultations booked yet." />}</div></section>
      <section className="rounded-2xl bg-card p-6"><h2 className="font-display text-3xl">Recent estimates</h2><div className="mt-5 space-y-3">{estimates.length ? estimates.map((estimate) => <Link href={`/admin/estimates/${estimate.id}`} key={estimate.id} className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition hover:bg-secondary/60"><div><p className="font-display text-lg">{estimate.customer_name}</p><p className="mt-1 text-xs text-ink/55">{estimate.event_date || "Date undecided"} · {estimate.fulfillment} · {estimate.status}</p></div><p className="font-display text-xl">{formatMoney(estimate.total_cents)}</p></Link>) : <Empty copy="Saved estimates will appear here." />}</div></section></div>
  </div></div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-card p-6"><div className="size-5 text-fig">{icon}</div><p className="mt-6 text-xs uppercase tracking-[0.16em] text-ink/50">{label}</p><p className="mt-2 font-display text-4xl">{value}</p></div>; }
function Empty({ copy }: { copy: string }) { return <p className="rounded-xl bg-secondary p-5 text-sm text-ink/55">{copy}</p>; }
function AdminSetup({ message }: { message: string }) { return <div className="min-h-[70vh] bg-limestone px-6 py-24"><div className="mx-auto max-w-xl rounded-2xl bg-card p-8"><p className="text-xs uppercase tracking-[0.2em] text-fig">Setup required</p><h1 className="mt-3 font-display text-4xl">Lydia’s Dashboard</h1><p className="mt-5 leading-7 text-ink/65">{message}</p><p className="mt-4 text-sm text-ink/50">Follow SETUP.md in the project root.</p></div></div>; }
function AdminLogin({ error }: { error?: string }) { return <div className="flex min-h-[70vh] items-center bg-limestone px-6 py-20"><div className="mx-auto w-full max-w-lg rounded-2xl bg-card p-8 text-center"><p className="text-xs uppercase tracking-[0.2em] text-fig">Private workspace</p><h1 className="mt-3 font-display text-4xl">Lydia’s Dashboard</h1><p className="mt-4 leading-7 text-ink/60">Sign in with an approved Google account. Dashboard access does not grant this site access to your email or calendar.</p>{error ? <p className="mt-4 rounded-lg bg-terracotta/15 p-3 text-sm">{error}</p> : null}<a href="/api/admin/auth/start" className="mt-7 inline-flex h-12 items-center rounded-lg bg-fig px-7 text-xs uppercase tracking-[0.17em] text-limestone">Continue with Google</a></div></div>; }
