import Link from "next/link";

export default function StudioPage() {
  const services = [
    {
      title: "Content Ideation",
      desc: "Campaign concepts, captions, and content pillars that sound like your brand.",
    },
    {
      title: "Ad Management",
      desc: "Meta and Pinterest ads built, monitored, and optimized for real results.",
    },
    {
      title: "Creative Direction",
      desc: "A cohesive visual language and mood for launches, collections, and campaigns.",
    },
    {
      title: "Brand Storytelling",
      desc: "Positioning and narrative that turn features into feelings.",
    },
    {
      title: "Campaign Strategy",
      desc: "End-to-end plans for launches, holidays, and evergreen growth.",
    },
    {
      title: "Social Content Systems",
      desc: "Workflows, templates, and guardrails that keep creative consistent.",
    },
  ];

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center justify-center bg-denim text-limestone">
        <img
          src="https://picsum.photos/seed/studio/1600/900"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-denim/50" />
        <div className="relative z-10 px-6 text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-olive">
            The Studio
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-[0.95] md:text-6xl lg:text-7xl">
            Marketing that feels intentional, not algorithmic.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-limestone/80">
            Content ideation, ad management, and creative direction for brands with
            something to say.
          </p>
        </div>
      </section>

      <section className="bg-limestone px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.25em] text-olive">
              Services
            </p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              What we do in the Studio.
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="border-t border-ink/10 pt-6"
              >
                <h3 className="font-display text-lg uppercase tracking-[0.15em]">
                  {service.title}
                </h3>
                <p className="mt-3 font-body text-ink/70">{service.desc}</p>
              </div>
            ))}
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
                title: "Audit",
                desc: "We look at what you have, what’s working, and where the story breaks.",
              },
              {
                step: "02",
                title: "Strategize",
                desc: "A clear plan, content map, and channel priorities built for your goals.",
              },
              {
                step: "03",
                title: "Create",
                desc: "Ideas, copy, and direction brought to life with your audience in mind.",
              },
              {
                step: "04",
                title: "Optimize",
                desc: "We test, learn, and refine so the work keeps getting better.",
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
        <h2 className="font-display text-3xl md:text-4xl">Ready to create?</h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-lg text-ink/70">
          Tell us about your brand and what you&apos;re building next.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-sm bg-denim px-8 font-display text-xs uppercase tracking-[0.25em] text-limestone transition hover:bg-denim/90"
        >
          Start a Project
        </Link>
      </section>
    </>
  );
}
