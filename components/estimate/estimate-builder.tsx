"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Mail,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import type {
  AvailabilitySlot,
  CartLine,
  CatalogProduct,
  DeliveryEstimate,
  EstimateDetails,
} from "@/lib/estimator/types";
import { formatMoney } from "@/lib/estimator/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMUNICATIONS_CONSENT_TEXT, MARKETING_CONSENT_TEXT } from "@/lib/consent-copy";

const CART_KEY = "second-nature-estimate-v1";
const TOKEN_KEY = "second-nature-estimate-token-v1";
const categoryLabels: Record<CatalogProduct["category"], string> = {
  "table-linens": "Table Linens",
  napkins: "Napkins",
  chargers: "Chargers",
  plates: "Plates",
  flatware: "Flatware",
  "custom-details": "Custom Details",
};

const emptyDetails: EstimateDetails = {
  name: "",
  email: "",
  phone: "",
  eventDate: "",
  dateUndecided: false,
  guestCount: "",
  venueName: "",
  venueAddress: "",
  fulfillment: "pickup",
  notes: "",
  communicationsConsent: false,
  marketingConsent: false,
};

type Stage = "shop" | "review" | "schedule" | "confirmed";

export function EstimateBuilder({
  products,
  resumeToken,
  heading = "Build Your Estimate",
  eyebrow = "Event rentals · Charlotte, NC",
  intro = "Explore the pieces that speak to you. We’ll keep a running starting estimate—no account, no pressure, and no inventory reserved just yet.",
}: {
  products: CatalogProduct[];
  resumeToken?: string;
  heading?: string;
  eyebrow?: string;
  intro?: string;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [details, setDetails] = useState<EstimateDetails>(emptyDetails);
  const [activeCategory, setActiveCategory] = useState<
    "all" | CatalogProduct["category"]
  >("all");
  const [tier, setTier] = useState("all");
  const [stage, setStage] = useState<Stage>("shop");
  const [saveOpen, setSaveOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedToken, setSavedToken] = useState(resumeToken || "");
  const [storageReady, setStorageReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [resumeFallbackUrl, setResumeFallbackUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(Boolean(resumeToken));
  const [delivery, setDelivery] = useState<DeliveryEstimate | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotStart, setSlotStart] = useState("");
  const [confirmation, setConfirmation] = useState<{
    appointmentLabel: string;
    meetUrl: string | null;
  } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem(CART_KEY);
      if (stored) {
        try {
          setCart(JSON.parse(stored) as CartLine[]);
        } catch {
          window.localStorage.removeItem(CART_KEY);
        }
      }
      const token = resumeToken || window.localStorage.getItem(TOKEN_KEY) || "";
      if (token) setSavedToken(token);
      setStorageReady(true);
    });
  }, [resumeToken]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, storageReady]);

  useEffect(() => {
    if (!resumeToken) return;
    fetch(`/api/estimates/resume/${encodeURIComponent(resumeToken)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        setCart(payload.cart);
        setDetails({ ...emptyDetails, ...payload.details });
        window.localStorage.setItem(TOKEN_KEY, resumeToken);
        setNotice("Your saved estimate is ready.");
      })
      .catch((reason) =>
        setError(reason.message || "Your saved estimate could not be opened."),
      )
      .finally(() => setBusy(false));
  }, [resumeToken]);

  const variantMap = useMemo(
    () =>
      new Map(
        products.flatMap((product) =>
          product.variants.map(
            (variant) => [variant.id, { product, variant }] as const,
          ),
        ),
      ),
    [products],
  );
  const cartRows = cart.flatMap((line) => {
    const match = variantMap.get(line.variantId);
    return match
      ? [
          {
            ...line,
            ...match,
            lineTotal: match.variant.unitPriceCents * line.quantity,
          },
        ]
      : [];
  });
  const subtotal = cartRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const total =
    subtotal +
    (delivery?.deliveryFeeCents || 0) +
    (delivery?.fullServiceFeeCents || 0);
  const filtered = products.filter(
    (product) =>
      (activeCategory === "all" || product.category === activeCategory) &&
      (tier === "all" || product.tier === tier),
  );

  function add(variantId: string, quantity: number) {
    setCart((current) => {
      const existing = current.find((line) => line.variantId === variantId);
      return existing
        ? current.map((line) =>
            line.variantId === variantId
              ? { ...line, quantity: Math.min(10000, line.quantity + quantity) }
              : line,
          )
        : [...current, { variantId, quantity }];
    });
    setNotice("Added to your estimate.");
  }

  function changeQuantity(variantId: string, amount: number) {
    setCart((current) =>
      current.flatMap((line) => {
        if (line.variantId !== variantId) return [line];
        const quantity = line.quantity + amount;
        return quantity > 0 ? [{ ...line, quantity }] : [];
      }),
    );
  }

  function setLineQuantity(variantId: string, quantity: number) {
    const safeQuantity = Math.min(10000, Math.max(1, quantity || 1));
    setCart((current) =>
      current.map((line) =>
        line.variantId === variantId
          ? { ...line, quantity: safeQuantity }
          : line,
      ),
    );
  }

  async function saveForLater(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/estimates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          details,
          resumeToken: savedToken || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setSavedToken(payload.resumeToken);
      window.localStorage.setItem(TOKEN_KEY, payload.resumeToken);
      setSaveOpen(false);
      if (payload.emailSent) {
        setResumeFallbackUrl("");
        setNotice("Saved. Check your inbox for a private link.");
      } else {
        setResumeFallbackUrl(payload.resumeUrl);
        setNotice("Your estimate is saved.");
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not save your estimate.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function continueToSchedule(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setDelivery(null);
    try {
      if (!details.dateUndecided && !details.eventDate)
        throw new Error("Choose an event date or select ‘Not sure yet’. ");
      if (details.fulfillment !== "pickup") {
        const deliveryResponse = await fetch("/api/delivery/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: details.venueAddress,
            fulfillment: details.fulfillment,
          }),
        });
        const deliveryPayload = await deliveryResponse.json();
        if (!deliveryResponse.ok) throw new Error(deliveryPayload.error);
        setDelivery(deliveryPayload);
      }
      const slotResponse = await fetch("/api/availability");
      const slotPayload = await slotResponse.json();
      if (!slotResponse.ok) throw new Error(slotPayload.error);
      setSlots(slotPayload.slots);
      setStage("schedule");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not continue.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function book() {
    if (!slotStart) {
      setError("Choose a consultation time.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/estimates/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          details,
          slotStart,
          resumeToken: savedToken || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      if (payload.resumeToken) {
        setSavedToken(payload.resumeToken);
        window.localStorage.setItem(TOKEN_KEY, payload.resumeToken);
      }
      setConfirmation(payload);
      setStage("confirmed");
      window.localStorage.removeItem(CART_KEY);
      setCart([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not book the consultation.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (stage === "confirmed" && confirmation)
    return (
      <Confirmation
        appointmentLabel={confirmation.appointmentLabel}
        meetUrl={confirmation.meetUrl}
      />
    );

  return (
    <div className="min-h-screen bg-limestone text-ink">
      <section className="border-b border-ink/10 px-4 py-8 sm:px-6 sm:py-10 md:px-16 md:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="font-body text-xs uppercase tracking-[0.22em] text-fig">
            {eyebrow}
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-4xl leading-[0.98] sm:text-5xl md:text-6xl">
                {heading}
              </h1>
              <p className="mt-4 max-w-2xl font-body text-base leading-7 text-ink/70">
                {intro}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary p-5">
              <p className="font-display text-xl">
                Prefer to start with a conversation?
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Book a complimentary Google Meet and tell Lydia what you’re
                imagining.
              </p>
              <Link
                href="/consultation"
                className="mt-4 inline-flex text-[11px] uppercase tracking-[0.14em] text-fig underline underline-offset-4 sm:text-xs sm:tracking-[0.18em]"
              >
                Schedule a free consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <div
          className="fixed right-5 top-5 z-[70] rounded-full bg-ink px-5 py-3 text-sm text-limestone shadow-xl"
          onClick={() => setNotice("")}
        >
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="mx-auto mt-6 flex max-w-7xl items-center justify-between rounded-xl bg-terracotta/15 px-5 py-4 text-sm text-ink">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      ) : null}
      {resumeFallbackUrl ? (
        <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-3 rounded-xl bg-olive/15 px-5 py-4 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Your estimate is saved.</p>
            <p className="mt-1 text-ink/65">
              The email could not be sent, so keep this private link.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={resumeFallbackUrl}
              className="text-xs font-medium uppercase tracking-[0.12em] text-fig underline underline-offset-4"
            >
              Open link
            </a>
            <button
              type="button"
              className="rounded-lg bg-fig px-4 py-2 text-xs uppercase tracking-[0.12em] text-limestone"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(resumeFallbackUrl);
                  setNotice("Private link copied.");
                } catch {
                  setNotice("Open the private link, then copy it from your browser.");
                }
              }}
            >
              Copy private link
            </button>
            <button
              type="button"
              onClick={() => setResumeFallbackUrl("")}
              aria-label="Dismiss saved estimate link"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      {stage === "shop" ? (
        <section className="overflow-hidden px-4 py-8 sm:px-6 sm:py-10 md:px-16 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl bg-secondary p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-display text-xl">Want a little direction?</p>
                  <p className="mt-1 text-sm text-ink/60">Start with one of Lydia’s precurated looks.</p>
                </div>
                <Link href="/gatherings/collections" className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-fig px-5 text-xs uppercase tracking-[0.14em] text-limestone">
                  Shop By Collections
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:hidden">
                <label className="min-w-0">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-ink/50">
                    Category
                  </span>
                  <select
                    aria-label="Filter by category"
                    value={activeCategory}
                    onChange={(event) =>
                      setActiveCategory(
                        event.target.value as
                          | "all"
                          | CatalogProduct["category"],
                      )
                    }
                    className="h-11 w-full min-w-0 rounded-lg border border-ink/15 bg-card px-3 text-sm text-ink"
                  >
                    <option value="all">Everything</option>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-ink/50">
                    Price level
                  </span>
                  <select
                    aria-label="Filter by price level"
                    value={tier}
                    onChange={(event) => setTier(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-lg border border-ink/15 bg-card px-3 text-sm text-ink"
                  >
                    <option value="all">All levels</option>
                    {["Essential", "Premium", "Luxe", "Signature"].map(
                      (value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              <div className="hidden gap-2 overflow-x-auto pb-3 sm:flex">
                <FilterButton
                  active={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                >
                  Everything
                </FilterButton>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <FilterButton
                    key={key}
                    active={activeCategory === key}
                    onClick={() =>
                      setActiveCategory(key as CatalogProduct["category"])
                    }
                  >
                    {label}
                  </FilterButton>
                ))}
              </div>
              <div className="mt-4 hidden flex-wrap items-center gap-2 sm:flex">
                <span className="mr-2 text-xs uppercase tracking-[0.18em] text-ink/50">
                  Price level
                </span>
                {["all", "Essential", "Premium", "Luxe", "Signature"].map(
                  (value) => (
                    <FilterButton
                      key={value}
                      small
                      active={tier === value}
                      onClick={() => setTier(value)}
                    >
                      {value === "all" ? "All" : value}
                    </FilterButton>
                  ),
                )}
              </div>
              <div className="mt-6 grid min-w-0 gap-5 sm:mt-7 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} add={add} />
                ))}
              </div>
              {!filtered.length ? (
                <p className="py-20 text-center text-ink/60">
                  No pieces match those filters just yet.
                </p>
              ) : null}
            </div>
            <CartPanel
              rows={cartRows}
              subtotal={subtotal}
              changeQuantity={changeQuantity}
              setQuantity={setLineQuantity}
              onReview={() => setStage("review")}
              onSave={() => setSaveOpen(true)}
            />
          </div>
        </section>
      ) : null}

      {stage === "review" ? (
        <Review
          details={details}
          setDetails={setDetails}
          rows={cartRows}
          subtotal={subtotal}
          changeQuantity={changeQuantity}
          setQuantity={setLineQuantity}
          onBack={() => setStage("shop")}
          onSubmit={continueToSchedule}
          busy={busy}
          onSave={() => setSaveOpen(true)}
        />
      ) : null}
      {stage === "schedule" ? (
        <Schedule
          slots={slots}
          selected={slotStart}
          setSelected={setSlotStart}
          details={details}
          setDetails={setDetails}
          rows={cartRows}
          subtotal={subtotal}
          delivery={delivery}
          total={total}
          onBack={() => setStage("review")}
          onBook={book}
          busy={busy}
        />
      ) : null}

      {cartRows.length && stage === "shop" ? (
        <button
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex items-center justify-between rounded-xl bg-fig px-5 py-4 text-limestone shadow-2xl xl:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="flex items-center gap-2 text-sm">
            <ShoppingBag className="size-4" /> {cartRows.length} selection
            {cartRows.length === 1 ? "" : "s"}
          </span>
          <span className="font-display text-xl">{formatMoney(subtotal)}</span>
        </button>
      ) : null}
      {drawerOpen ? (
        <div
          className="fixed inset-0 z-[80] bg-ink/35 p-4 xl:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-t-3xl bg-limestone p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-5 top-5"
              onClick={() => setDrawerOpen(false)}
            >
              <X />
            </button>
            <CartPanel
              mobile
              rows={cartRows}
              subtotal={subtotal}
              changeQuantity={changeQuantity}
              setQuantity={setLineQuantity}
              onReview={() => {
                setDrawerOpen(false);
                setStage("review");
              }}
              onSave={() => {
                setDrawerOpen(false);
                setSaveOpen(true);
              }}
            />
          </div>
        </div>
      ) : null}
      {saveOpen ? (
        <SaveModal
          details={details}
          setDetails={setDetails}
          onClose={() => setSaveOpen(false)}
          onSubmit={saveForLater}
          busy={busy}
        />
      ) : null}
    </div>
  );
}

function ProductCard({
  product,
  add,
}: {
  product: CatalogProduct;
  add: (variantId: string, quantity: number) => void;
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const variant =
    product.variants.find((item) => item.id === variantId) ||
    product.variants[0];
  const lowest = Math.min(
    ...product.variants.map((item) => item.unitPriceCents),
  );
  const selectedImage = variant?.imagePath || product.imagePath;
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-ink/10 bg-card">
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{ backgroundColor: product.accent }}
      >
        <Image
          src={selectedImage}
          alt="Representative styling placeholder"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover mix-blend-soft-light opacity-90"
        />
        <div className="absolute left-4 top-4 rounded-full bg-limestone/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-ink">
          {product.tier}
        </div>
      </div>
      <div className="p-4">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl leading-tight">
              {product.publicName}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/50">
              {product.material}
            </p>
          </div>
          <p className="whitespace-nowrap text-right font-display text-base">
            {product.pricePrefix || "From"} {formatMoney(lowest)}
          </p>
        </div>
        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-ink/65">
          {product.description}
        </p>
        {product.variants.length > 1 || product.variants[0]?.label !== "Standard" ? (
          <>
            <Label htmlFor={`${product.id}-variant`} className="mt-4 block text-xs uppercase tracking-[0.15em]">Option</Label>
            <select id={`${product.id}-variant`} value={variantId} onChange={(e) => setVariantId(e.target.value)} className="mt-2 h-10 w-full rounded-lg border bg-limestone px-3 text-sm">
              {product.variants.map((item) => (
                <option key={item.id} value={item.id}>{item.label} · {formatMoney(item.unitPriceCents)} each</option>
              ))}
            </select>
          </>
        ) : null}
        <div className="mt-3 flex min-w-0 gap-2">
          <div className="flex h-10 shrink-0 items-center rounded-lg border bg-limestone">
            <button
              type="button"
              className="h-full px-2.5"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease"
            >
              <Minus className="size-3" />
            </button>
            <input
              type="number"
              min={1}
              max={10000}
              inputMode="numeric"
              aria-label={`Quantity for ${product.publicName}`}
              value={quantity}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) =>
                setQuantity(
                  Math.min(10000, Math.max(1, Number(event.target.value) || 1)),
                )
              }
              className="h-full w-12 border-x border-ink/10 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              className="h-full px-2.5"
              onClick={() => setQuantity(Math.min(10000, quantity + 1))}
              aria-label="Increase"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <Button
            className="h-10 min-w-0 flex-1 overflow-hidden bg-olive px-2 text-[10px] uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em]"
            onClick={() => add(variant.id, quantity)}
          >
            Add · {formatMoney(variant.unitPriceCents * quantity)}
          </Button>
        </div>
      </div>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  children,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border transition",
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        active
          ? "border-ink bg-ink text-limestone"
          : "border-ink/15 bg-transparent text-ink hover:border-ink/40",
      )}
    >
      {children}
    </button>
  );
}

type CartRow = CartLine & {
  product: CatalogProduct;
  variant: CatalogProduct["variants"][number];
  lineTotal: number;
};
function CartPanel({
  rows,
  subtotal,
  changeQuantity,
  setQuantity,
  onReview,
  onSave,
  mobile = false,
  summaryOnly = false,
}: {
  rows: CartRow[];
  subtotal: number;
  changeQuantity: (id: string, amount: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  onReview: () => void;
  onSave: () => void;
  mobile?: boolean;
  summaryOnly?: boolean;
}) {
  return (
    <aside
      className={cn(
        !mobile &&
          "sticky top-6 hidden h-fit rounded-2xl border border-ink/10 bg-card p-5 xl:block",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Your Estimate</h2>
        <ShoppingBag className="size-5 text-fig" />
      </div>
      {!rows.length ? (
        <div className="py-12 text-center">
          <Sparkles className="mx-auto size-6 text-olive" />
          <p className="mt-3 text-sm leading-6 text-ink/55">
            The pieces you love will gather here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 max-h-[45vh] space-y-4 overflow-y-auto pr-1">
            {rows.map((row) => (
              <div key={row.variantId} className="border-b border-ink/10 pb-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-display text-base">
                      {row.product.publicName}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-ink/55">
                      {row.variant.label}
                    </p>
                  </div>
                  <p className="text-sm">{formatMoney(row.lineTotal)}</p>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <button
                    type="button"
                    className="p-2"
                    onClick={() => changeQuantity(row.variantId, -1)}
                    aria-label={`Decrease ${row.product.publicName}`}
                  >
                    <Minus className="size-3" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    inputMode="numeric"
                    aria-label={`Quantity for ${row.product.publicName} in estimate`}
                    value={row.quantity}
                    onFocus={(event) => event.currentTarget.select()}
                    onChange={(event) =>
                      setQuantity(row.variantId, Number(event.target.value))
                    }
                    className="h-8 w-16 rounded-md border border-ink/10 bg-limestone px-1 text-center text-xs outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    className="p-2"
                    onClick={() => changeQuantity(row.variantId, 1)}
                    aria-label={`Increase ${row.product.publicName}`}
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between">
            <span className="text-xs uppercase tracking-[0.16em] text-ink/55">
              Starting subtotal
            </span>
            <span className="font-display text-2xl">
              {formatMoney(subtotal)}
            </span>
          </div>
          {!summaryOnly ? (
            <>
              <Button
                type="button"
                onClick={onReview}
                className="mt-5 h-12 w-full bg-fig text-xs uppercase tracking-[0.17em]"
              >
                Review estimate
              </Button>
              <button
                type="button"
                onClick={onSave}
                className="mt-4 flex w-full items-center justify-center gap-2 text-xs text-ink/60 underline underline-offset-4"
              >
                <Mail className="size-3" /> Save for later
              </button>
            </>
          ) : null}
        </>
      )}
    </aside>
  );
}

function SaveModal({
  details,
  setDetails,
  onClose,
  onSubmit,
  busy,
}: {
  details: EstimateDetails;
  setDetails: (details: EstimateDetails) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/45 p-5"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md rounded-2xl bg-limestone p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-5 top-5"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
        <Mail className="size-6 text-fig" />
        <h2 className="mt-4 font-display text-3xl">Keep your place</h2>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          We’ll email a private link to these selections. You can keep shopping
          without creating an account.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="save-name">Name</Label>
            <Input
              id="save-name"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="save-email">Email</Label>
            <Input
              id="save-email"
              type="email"
              value={details.email}
              onChange={(e) =>
                setDetails({ ...details, email: e.target.value })
              }
              required
              className="mt-2"
            />
          </div>
        </div>
        <Button
          disabled={busy}
          className="mt-6 h-12 w-full bg-olive text-xs uppercase tracking-[0.17em]"
        >
          {busy ? "Saving…" : "Email my private link"}
        </Button>
      </form>
    </div>
  );
}

function Review({
  details,
  setDetails,
  rows,
  subtotal,
  changeQuantity,
  setQuantity,
  onBack,
  onSubmit,
  busy,
  onSave,
}: {
  details: EstimateDetails;
  setDetails: (d: EstimateDetails) => void;
  rows: CartRow[];
  subtotal: number;
  changeQuantity: (id: string, n: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
  onSave: () => void;
}) {
  return (
    <section className="px-6 py-12 md:px-16">
      <form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_390px]"
      >
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ink/60"
          >
            <ChevronLeft className="size-4" /> Keep shopping
          </button>
          <h2 className="mt-6 font-display text-4xl md:text-5xl">
            A few details, then Lydia.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-ink/65">
            These details help shape the starting estimate. Lydia will confirm
            availability and final pricing with you.
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            <Field label="Name">
              <Input
                required
                value={details.name}
                onChange={(e) =>
                  setDetails({ ...details, name: e.target.value })
                }
              />
            </Field>
            <Field label="Email">
              <Input
                required
                type="email"
                value={details.email}
                onChange={(e) =>
                  setDetails({ ...details, email: e.target.value })
                }
              />
            </Field>
            <Field label="Phone">
              <Input
                required
                type="tel"
                autoComplete="tel"
                value={details.phone}
                onChange={(e) =>
                  setDetails({ ...details, phone: e.target.value })
                }
              />
            </Field>
            <Field label="Event date">
              <Input
                disabled={details.dateUndecided}
                required={!details.dateUndecided}
                type="date"
                value={details.eventDate}
                onChange={(e) =>
                  setDetails({ ...details, eventDate: e.target.value })
                }
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-ink/60">
                <input
                  type="checkbox"
                  checked={details.dateUndecided}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      dateUndecided: e.target.checked,
                      eventDate: e.target.checked ? "" : details.eventDate,
                    })
                  }
                />{" "}
                Not sure yet
              </label>
            </Field>
            <Field label="Estimated guest count">
              <Input
                inputMode="numeric"
                placeholder="Optional"
                value={details.guestCount}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    guestCount: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </Field>
            <Field label="Venue name">
              <Input
                placeholder="Optional"
                value={details.venueName}
                onChange={(e) =>
                  setDetails({ ...details, venueName: e.target.value })
                }
              />
            </Field>
          </div>
          <fieldset className="mt-7">
            <legend className="text-sm font-medium">
              How should everything arrive?
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                ["pickup", "Customer pickup", "Wesley Heights area"],
                ["delivery", "Delivery", "Estimated by distance"],
                ["full-service", "Full service", "Delivery, setup & styling"],
              ].map(([value, title, copy]) => (
                <label
                  key={value}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4",
                    details.fulfillment === value
                      ? "border-fig bg-fig/5"
                      : "border-ink/10",
                  )}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="fulfillment"
                    value={value}
                    checked={details.fulfillment === value}
                    onChange={() =>
                      setDetails({
                        ...details,
                        fulfillment: value as EstimateDetails["fulfillment"],
                      })
                    }
                  />
                  <span className="font-display text-lg">{title}</span>
                  <span className="mt-1 block text-xs text-ink/55">{copy}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {details.fulfillment !== "pickup" ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Venue address">
                <Input
                  required
                  placeholder="Street, city, state, ZIP"
                  value={details.venueAddress}
                  onChange={(e) =>
                    setDetails({ ...details, venueAddress: e.target.value })
                  }
                />
              </Field>
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-secondary p-4 text-sm leading-6 text-ink/65">
              Pickup is available in the Wesley Heights area of Charlotte. Exact
              instructions are shared after your reservation is confirmed.
            </p>
          )}
          <Field label="Anything Lydia should know?" className="mt-6">
            <Textarea
              rows={5}
              placeholder="Colors, venue details, special requests, questions—anything that will make your conversation more useful."
              value={details.notes}
              onChange={(e) =>
                setDetails({ ...details, notes: e.target.value })
              }
            />
          </Field>
          <Button
            disabled={busy}
            className="mt-7 h-12 bg-fig px-8 text-xs uppercase tracking-[0.17em]"
          >
            {busy ? "Preparing…" : "Choose a consultation time"}
          </Button>
          <button
            type="button"
            onClick={onSave}
            className="ml-5 text-xs text-ink/60 underline underline-offset-4"
          >
            Save for later
          </button>
        </div>
        <CartPanel
          mobile
          summaryOnly
          rows={rows}
          subtotal={subtotal}
          changeQuantity={changeQuantity}
          setQuantity={setQuantity}
          onReview={() => {}}
          onSave={onSave}
        />
      </form>
    </section>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      {children}
    </div>
  );
}

function Schedule({
  slots,
  selected,
  setSelected,
  details,
  setDetails,
  rows,
  subtotal,
  delivery,
  total,
  onBack,
  onBook,
  busy,
}: {
  slots: AvailabilitySlot[];
  selected: string;
  setSelected: (s: string) => void;
  details: EstimateDetails;
  setDetails: (d: EstimateDetails) => void;
  rows: CartRow[];
  subtotal: number;
  delivery: DeliveryEstimate | null;
  total: number;
  onBack: () => void;
  onBook: () => void;
  busy: boolean;
}) {
  const days = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const key = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(slot.start));
      map.set(key, [...(map.get(key) || []), slot]);
    }
    return [...map.entries()].slice(0, 8);
  }, [slots]);
  return (
    <section className="px-6 py-12 md:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_390px]">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ink/60"
          >
            <ChevronLeft className="size-4" /> Edit details
          </button>
          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-fig">
            Complimentary · 30 minutes · Google Meet
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Choose time with Lydia
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-ink/65">
            A personal review is where the estimate becomes yours. Talk through
            the pieces, questions, and bundle pricing together.
          </p>
          {days.length ? (
            <div className="mt-8 space-y-5">
              {days.map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="font-display text-xl">
                    {new Intl.DateTimeFormat("en-US", {
                      timeZone: "America/New_York",
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }).format(new Date(dateSlots[0].start))}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dateSlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelected(slot.start)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm",
                          selected === slot.start
                            ? "border-fig bg-fig text-limestone"
                            : "border-ink/15 hover:border-fig",
                        )}
                      >
                        {new Intl.DateTimeFormat("en-US", {
                          timeZone: "America/New_York",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(slot.start))}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl bg-secondary p-6">
              <p className="font-display text-xl">
                No times are showing just yet.
              </p>
              <p className="mt-2 text-sm text-ink/65">
                Save your estimate and Lydia can follow up personally.
              </p>
            </div>
          )}
        </div>
        <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm">
          <CalendarDays className="size-5 text-fig" />
          <h3 className="mt-4 font-display text-2xl">Starting estimate</h3>
          <div className="mt-5 max-h-52 space-y-3 overflow-y-auto">
            {rows.map((row) => (
              <div
                key={row.variantId}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="text-ink/65">
                  {row.quantity} × {row.product.publicName}
                </span>
                <span>{formatMoney(row.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Rentals</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {delivery?.deliveryFeeCents ? (
              <div className="flex justify-between">
                <span>Estimated delivery</span>
                <span>{formatMoney(delivery.deliveryFeeCents)}</span>
              </div>
            ) : null}
            {delivery?.fullServiceFeeCents ? (
              <div className="flex justify-between">
                <span>Full service, starting at</span>
                <span>{formatMoney(delivery.fullServiceFeeCents)}</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-2 font-display text-2xl">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          <p className="mt-5 text-xs leading-5 text-ink/55">
            Your selections are a starting point and aren’t reserved just yet.
            Lydia will confirm availability and final pricing with you.
          </p>
          <div className="mt-5 space-y-4 border-t border-ink/10 pt-5">
            <ConsentCheckbox
              required
              checked={details.communicationsConsent}
              onChange={(checked) =>
                setDetails({ ...details, communicationsConsent: checked })
              }
              text={COMMUNICATIONS_CONSENT_TEXT}
            />
            <ConsentCheckbox
              checked={details.marketingConsent}
              onChange={(checked) =>
                setDetails({ ...details, marketingConsent: checked })
              }
              text={MARKETING_CONSENT_TEXT}
            />
            <p className="text-[11px] leading-5 text-ink/45">
              Marketing consent is optional and can be withdrawn at any time.
            </p>
          </div>
          <Button
            disabled={busy || !selected || !details.communicationsConsent}
            onClick={onBook}
            className="mt-5 h-12 w-full bg-fig text-xs uppercase tracking-[0.16em]"
          >
            {busy ? "Booking…" : "Book review & send estimate"}
          </Button>
          <p className="mt-3 text-center text-[11px] text-ink/45">
            A Google Meet invitation will be emailed to {details.email}.
          </p>
        </aside>
      </div>
    </section>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  text,
  required = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  text: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 text-xs leading-5 text-ink/70">
      <input
        type="checkbox"
        required={required}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-fig"
      />
      <span>{text}{required ? " *" : ""}</span>
    </label>
  );
}

function Confirmation({
  appointmentLabel,
  meetUrl,
}: {
  appointmentLabel: string;
  meetUrl: string | null;
}) {
  return (
    <section className="flex min-h-[70vh] items-center bg-limestone px-6 py-20 text-center md:px-16">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-fig text-limestone">
          <Check className="size-7" />
        </div>
        <p className="mt-7 text-xs uppercase tracking-[0.2em] text-fig">
          You’re on Lydia’s calendar
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">
          Let’s make it feel like you.
        </h1>
        <p className="mt-5 text-lg leading-8 text-ink/65">
          Your estimate and meeting details are headed to your inbox.
        </p>
        <div className="mt-8 rounded-2xl bg-card p-6 font-display text-2xl">
          {appointmentLabel}
        </div>
        {meetUrl ? (
          <a
            href={meetUrl}
            className="mt-7 inline-flex h-12 items-center rounded-lg bg-fig px-7 text-xs uppercase tracking-[0.17em] text-limestone"
          >
            Join Google Meet
          </a>
        ) : null}
        <Link
          href="/gatherings"
          className="mt-7 block text-sm text-ink/55 underline underline-offset-4"
        >
          Back to Gatherings
        </Link>
      </div>
    </section>
  );
}
