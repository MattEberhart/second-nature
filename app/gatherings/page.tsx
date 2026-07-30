import Link from "next/link";

export default function GatheringsPage() {
  return (
    <>
      <section className="relative flex min-h-[70vh] items-center justify-center bg-ink text-limestone">
        <img
          src="https://picsum.photos/seed/rentals/1600/900"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <div className="relative z-10 px-6 text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-olive">
            Gatherings
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-[0.95] md:text-6xl lg:text-7xl">
            Celebrations that feel like you.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-limestone/80">
            Curated rentals, styling & creative direction for weddings and
            celebrations in Charlotte and beyond.
          </p>
        </div>
      </section>

      <section className="bg-limestone px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.25em] text-olive">
                Services
              </p>
              <h2 className="mt-4 font-display text-3xl md:text-4xl">
                Everything you need to set the table.
              </h2>
              <ul className="mt-8 space-y-6 font-body text-lg text-ink/80">
                <li className="border-b border-ink/10 pb-4">
                  <strong className="text-ink">Curated Rentals</strong> – Vintage
                  plates, glassware, linens, and objects with personality.
                </li>
                <li className="border-b border-ink/10 pb-4">
                  <strong className="text-ink">Styling & Creative Direction</strong>{" "}
                  – A cohesive vision for your day, from flatlay to final dance.
                </li>
                <li className="border-b border-ink/10 pb-4">
                  <strong className="text-ink">Sourcing</strong> – One-of-a-kind
                  pieces found for your exact story.
                </li>
                <li className="border-b border-ink/10 pb-4">
                  <strong className="text-ink">On-site Styling</strong> – Hands-on
                  placement and finishing touches.
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://picsum.photos/seed/floral/600/800"
                alt=""
                className="h-64 w-full object-cover"
              />
              <img
                src="https://picsum.photos/seed/dish/600/800"
                alt=""
                className="h-64 w-full object-cover"
              />
              <img
                src="https://picsum.photos/seed/candle/600/800"
                alt=""
                className="h-64 w-full object-cover"
              />
              <img
                src="https://picsum.photos/seed/linen/600/800"
                alt=""
                className="h-64 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 py-24 text-ink">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-olive/80">
            Process
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Discover",
                desc: "We learn your story, style, and must-haves.",
              },
              {
                step: "02",
                title: "Curate",
                desc: "We source and pull pieces that feel like you.",
              },
              {
                step: "03",
                title: "Style",
                desc: "Layouts, layers, and final details come together.",
              },
              {
                step: "04",
                title: "Celebrate",
                desc: "You show up. We make sure every detail feels right.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <p className="font-display text-2xl text-olive">{s.step}</p>
                <h3 className="mt-3 font-display text-lg uppercase tracking-[0.15em]">
                  {s.title}
                </h3>
                <p className="mt-2 font-body text-sm text-ink/70">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-limestone px-6 py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl">Ready to gather?</h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-lg text-ink/70">
          Tell us about your celebration and we&apos;ll start curating.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-sm bg-ink px-8 font-display text-xs uppercase tracking-[0.25em] text-limestone transition hover:bg-ink/90"
        >
          Inquire
        </Link>
      </section>
    </>
  );
}
