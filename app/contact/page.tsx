import Image from "next/image";
import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <section className="bg-limestone px-6 pt-20 pb-16 text-center md:px-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-ink md:text-6xl lg:text-7xl">
            Contact Us
          </h1>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/gatherings"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-olive px-8 font-display text-xs uppercase tracking-[0.2em] text-limestone transition hover:bg-olive/90"
            >
              Book Your Event
            </Link>
            <Link
              href="/studio"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-olive px-8 font-display text-xs uppercase tracking-[0.2em] text-limestone transition hover:bg-olive/90"
            >
              Consulting
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-16 md:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Let&apos;s talk possibilities
          </h2>
          <p className="mt-3 max-w-2xl font-body text-lg text-ink/70">
            Reach out to us via the above forms and we will get back to you within 48 hours.
          </p>
          <div className="relative mt-10 aspect-[1084/610] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/about-hero.jpg"
              alt="Contact"
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
                src="/event-rentals-hero.jpg"
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
