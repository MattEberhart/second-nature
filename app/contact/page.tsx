import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { InquiryForm } from "./inquiry-form";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }> | { interest?: string };
}) {
  const params = await searchParams;
  const defaultInterest = params.interest || "";

  return (
    <>
      <section className="bg-limestone px-6 pt-20 pb-16 text-center md:px-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-ink md:text-6xl lg:text-7xl">
            Contact Us
          </h1>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact?interest=gatherings#inquiry"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-olive px-8 font-display text-xs uppercase tracking-[0.2em] text-limestone transition hover:bg-olive/90"
            >
              Book Your Event
            </Link>
            <Link
              href="/contact?interest=studio#inquiry"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-olive px-8 font-display text-xs uppercase tracking-[0.2em] text-limestone transition hover:bg-olive/90"
            >
              Consulting
            </Link>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="bg-limestone px-6 py-24 md:px-16">
            <div className="mx-auto max-w-2xl">
              <div className="h-96 animate-pulse rounded-2xl bg-secondary" />
            </div>
          </section>
        }
      >
        <InquiryForm defaultInterest={defaultInterest} />
      </Suspense>

      <section className="bg-limestone px-6 pb-16 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative aspect-[1084/610] overflow-hidden rounded-2xl bg-secondary">
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
