import Image from "next/image";
import Link from "next/link";

export default function StudioPage() {
  return (
    <>
      <section className="page-top bg-limestone px-6 pb-8 text-center md:px-16 md:pb-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="type-title text-ink">
            Digital Consulting
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-lg text-ink/70">
            Marketing that feels intentional, original, and unmistakably yours.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-olive px-8 type-label text-limestone transition hover:bg-olive/90"
          >
            Inquire About Services
          </Link>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-10 md:px-16">
        <div className="mx-auto max-w-7xl">
          {/* Kept short so the Pricing heading shows on a laptop screen without scrolling. */}
          <div className="relative mx-auto aspect-[2/1] max-w-4xl overflow-hidden rounded-2xl bg-secondary sm:aspect-auto sm:h-[min(260px,30vh)]">
            <Image
              src="/photos/studio-banner-v2.jpg"
              alt=""
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="type-section text-ink">Pricing</h2>
          <div className="mt-10 max-w-3xl space-y-8 font-body text-lg text-ink/80">
            <p>
              <strong className="text-ink">Creative & Marketing Consulting — $175 per hour</strong>
              <br />
              Flexible strategic and creative support across paid media, digital marketing, social media, email marketing, campaign planning, and brand communications.
            </p>
            <p>
              <strong className="text-ink">Design & Production Support — $65 per hour</strong>
              <br />
              Hands-on graphic design and production for advertisements, social content, email assets, presentations, campaign materials, and other digital deliverables.
            </p>
            <p>
              <strong className="text-ink">Ongoing Creative Partnership — retainers starting at $1,500 per month</strong>
              <br />
              Consistent marketing strategy, creative direction, and execution support tailored to your priorities, workload, and preferred level of involvement.
            </p>
            <p>
              <strong className="text-ink">Project and Campaign-Based Services — custom quoted</strong>
              <br />
              Defined campaigns, audits, launches, template systems, and larger design projects are priced according to scope, deliverables, and timeline.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
