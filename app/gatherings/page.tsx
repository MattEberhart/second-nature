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
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-olive px-8 font-display text-xs uppercase tracking-[0.2em] text-limestone transition hover:bg-olive/90"
          >
            Book Your Event
          </Link>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Pricing</h2>
          <div className="mt-10 space-y-8 font-body text-lg text-ink/80">
            <p>
              <strong className="text-ink">Curated Rentals — $500 order minimum</strong>
              <br />
              Thoughtfully selected linens, tabletop pieces, and décor, available for customer pickup.
            </p>
            <p>
              <strong className="text-ink">Delivered Rentals — $1,000 order minimum</strong>
              <br />
              Curated rentals delivered to your venue, with pickup after the event.
            </p>
            <p>
              <strong className="text-ink">Full-Service Rentals — $1,500 order minimum</strong>
              <br />
              Curated rentals with delivery, tabletop setup, styling, and post-event pickup.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-16 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative aspect-[1084/610] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/event-rentals-hero.jpg"
              alt="Event rentals"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[256fr_732fr]">
            <div className="relative aspect-[256/208] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/about-hero.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[732/208] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/consulting-hero.jpg"
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
