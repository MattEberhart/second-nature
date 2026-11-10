import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, UserRound } from "lucide-react";
import { getAdminUser } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { formatPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin");
  const { q = "" } = await searchParams;
  // Strip characters that are special in PostgREST filters / LIKE patterns, and
  // let any gap between words match anything (PostgREST "*" = SQL "%"), so
  // "(704) 555" finds "(704) 555-1234" and "jane doe" finds "Jane  Doe".
  const needle = q.replace(/[,()"\\%_*.:]/g, " ").trim().split(/\s+/).filter(Boolean).join("*");
  let query = getAdminSupabase()
    .from("contacts")
    .select(
      "id,name,email,phone,status,first_source,last_activity_at,contact_inquiries(count),estimates(count),appointments(count)",
    )
    .order("last_activity_at", { ascending: false })
    .limit(250);
  // Phone-looking queries match digits regardless of punctuation, so
  // "7045550123" finds a stored "(704) 555-0123".
  const queryDigits = /^[\d\s()+.-]+$/.test(q) ? q.replace(/\D/g, "") : "";
  const phoneDigits = queryDigits.length >= 3 ? queryDigits.split("").join("*") : "";
  if (needle) {
    query = query.or(
      `name.ilike.*${needle}*,email.ilike.*${needle}*,phone.ilike.*${needle}*` +
        (phoneDigits ? `,phone.ilike.*${phoneDigits}*` : ""),
    );
  }
  const { data, error } = await query;
  if (error) throw error;
  const contacts = data ?? [];

  return (
    <main className="min-h-screen bg-limestone px-6 py-12 text-ink md:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-ink/10 pb-8 md:flex-row md:items-end">
          <div>
            <Link href="/admin" className="text-xs uppercase tracking-[0.16em] text-fig">← Dashboard</Link>
            <h1 className="mt-4 font-display text-5xl">Customers</h1>
            <p className="mt-3 text-sm text-ink/55">Every inquiry, quote, appointment, and note in one place.</p>
          </div>
          <form className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-3 size-4 text-ink/40" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, email, or phone"
              className="h-10 w-full rounded-lg border border-ink/15 bg-card pl-10 pr-3 text-sm outline-none"
            />
          </form>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-card">
          {contacts.length ? (
            <div className="divide-y divide-ink/10">
              {contacts.map((contact) => {
                const inquiryCount = contact.contact_inquiries?.[0]?.count ?? 0;
                const estimateCount = contact.estimates?.[0]?.count ?? 0;
                const appointmentCount = contact.appointments?.[0]?.count ?? 0;
                return (
                  <Link
                    key={contact.id}
                    href={`/admin/customers/${contact.id}`}
                    className="grid gap-4 p-5 transition hover:bg-secondary/60 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-fig"><UserRound className="size-4" /></span>
                      <div>
                        <p className="font-display text-xl">{contact.name}</p>
                        <p className="mt-1 text-xs text-ink/50">{contact.email}{contact.phone ? ` · ${formatPhone(contact.phone)}` : ""}</p>
                      </div>
                    </div>
                    <p className="text-sm text-ink/60">
                      {inquiryCount} {inquiryCount === 1 ? "inquiry" : "inquiries"} · {estimateCount} {estimateCount === 1 ? "quote" : "quotes"} · {appointmentCount} {appointmentCount === 1 ? "call" : "calls"}
                    </p>
                    <div className="text-left md:text-right">
                      <span className="rounded-full bg-olive/15 px-3 py-1 text-xs capitalize text-ink/70">{contact.status}</span>
                      <p className="mt-2 text-[11px] text-ink/40">Updated {formatDate(contact.last_activity_at)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="p-10 text-center text-sm text-ink/50">No customers match that search.</p>
          )}
        </div>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}
