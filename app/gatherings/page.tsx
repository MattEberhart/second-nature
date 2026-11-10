import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    title: "Explore our Inventory",
    body: "Discover vintage treasures, timeless essentials, and unexpected details to make your table your own.",
  },
  {
    title: "Build Your Estimate or Schedule a Consultation",
    body: "Choose your pieces, select quantities, and see estimated pricing instantly—no inquiry required.",
  },
  {
    title: "We’ll Confirm the Details",
    body: "Submit your estimate, and we’ll confirm availability and help finalize your rentals.",
  },
];

export default function GatheringsPage() {
  return (
    <>
      <section className="page-top bg-limestone px-6 pb-16 text-center md:px-16 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="type-title text-ink">
            Event Rentals
          </h1>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/gatherings/estimate"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-fig px-8 type-label text-limestone transition hover:bg-fig/90"
            >
              Build Your Estimate
            </Link>
            <Link
              href="/gatherings/collections"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg border border-ink/20 px-8 type-label text-ink transition hover:border-ink/50"
            >
              Shop By Collections
            </Link>
            <Link
              href="/consultation"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-deep-olive px-8 type-label text-limestone transition hover:bg-deep-olive/90"
            >
              Free Consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="type-section text-ink">How It Works</h2>
          <ol className="mt-10 space-y-8 font-body text-lg text-ink/80">
            {steps.map((step) => (
              <li key={step.title}>
                <strong className="text-ink">{step.title}</strong>
                <br />
                {step.body}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="relative aspect-[732/348] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/photos/rentals-tablescape.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[732/348] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/photos/rentals-place-setting.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 75vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote className="font-display text-2xl leading-snug text-ink md:text-3xl">
            “Her ideas are not only thoughtful, but also beautifully brought to life.”
          </blockquote>
          <figcaption className="mt-5 font-body text-xs uppercase tracking-label text-ink/60">
            Lisa M.
          </figcaption>
        </figure>
      </section>
    </>
  );
}
