import Image from "next/image";
import Link from "next/link";

export default function GatheringsPage() {
  return (
    <>
      <section className="bg-limestone px-6 pt-20 pb-16 text-center md:px-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-ink md:text-6xl lg:text-7xl">
            Event Rentals
          </h1>
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <Link
              href="/gatherings/estimate"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-fig px-8 font-display text-xs uppercase tracking-[0.2em] text-limestone transition hover:bg-fig/90"
            >
              Build Your Estimate
            </Link>
            <Link
              href="/gatherings/collections"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg border border-ink/20 px-8 font-display text-xs uppercase tracking-[0.2em] text-ink transition hover:border-ink/50"
            >
              Shop By Collections
            </Link>
            <Link
              href="/consultation"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap px-8 font-display text-xs uppercase tracking-[0.2em] text-fig underline underline-offset-4"
            >
              Free Consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Gather your ideas first</h2>
          <div className="mt-10 space-y-8 font-body text-lg text-ink/80">
            <p>
              <strong className="text-ink">Customer Pickup</strong>
              <br />
              Thoughtfully selected linens, tabletop pieces, and décor, with pickup in the Wesley Heights area of Charlotte.
            </p>
            <p>
              <strong className="text-ink">Delivered Rentals</strong>
              <br />
              Curated rentals delivered to your venue, with an estimated delivery fee based on round-trip distance.
            </p>
            <p>
              <strong className="text-ink">Full-Service Rentals</strong>
              <br />
              Curated rentals with delivery, tabletop setup, styling, and post-event pickup.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="relative aspect-[732/348] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/event-rentals-1.png"
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[732/348] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/event-rentals-2.png"
                alt=""
                fill
                sizes="(min-width: 768px) 75vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
