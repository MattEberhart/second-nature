import Image from "next/image";
import Link from "next/link";

const gallery = [
  { src: "/about-hero.jpg", alt: "Creative direction" },
  { src: "/event-rentals-hero.jpg", alt: "Rental styling" },
  { src: "/consulting-hero.jpg", alt: "Digital consulting" },
  { src: "/about-hero.jpg", alt: "Brand storytelling" },
];

export default function StudioPage() {
  return (
    <>
      <section className="bg-limestone px-6 pt-20 pb-16 text-center md:px-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-ink md:text-6xl lg:text-7xl">
            Digital Consulting
          </h1>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center justify-center whitespace-nowrap rounded-lg bg-olive px-8 font-display text-xs uppercase tracking-[0.2em] text-limestone transition hover:bg-olive/90"
          >
            Inquire About Services
          </Link>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-16 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {gallery.map((img) => (
              <div
                key={img.src + img.alt}
                className="relative aspect-[280/376] overflow-hidden rounded-2xl bg-secondary"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Pricing</h2>
          <div className="mt-10 space-y-8 font-body text-lg text-ink/80">
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
