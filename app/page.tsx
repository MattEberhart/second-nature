import Link from "next/link";

const cards = [
  {
    title: "Gatherings",
    href: "/gatherings",
    body: "Curated rentals, styling, and creative direction for celebrations that feel unmistakably yours.",
  },
  {
    title: "The Studio",
    href: "/studio",
    body: "Content ideation, ad management, and brand storytelling for clients with something to say.",
  },
  {
    title: "Get in Touch",
    href: "/contact",
    body: "Start a project, ask a question, or tell us about your celebration.",
  },
];

export default function HomePage() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink text-limestone">
      <img
        src="https://picsum.photos/seed/celebration/1600/900"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-ink/50" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 text-center">
        <p
          className="mb-3 font-display text-xs uppercase tracking-[0.25em] text-olive"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
        >
          Based in Charlotte, NC
        </p>
        <h1 className="mx-auto max-w-4xl font-display text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
          Design that feels collected, never copied.
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-base italic text-limestone/90 md:text-lg">
          The smallest details often tell the biggest stories.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group border border-limestone/30 bg-limestone/10 p-6 text-left backdrop-blur-sm transition hover:bg-limestone/10"
            >
              <p className="font-display text-xs uppercase tracking-[0.2em] text-olive">
                {card.title}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-limestone/80">
                {card.body}
              </p>
              <span className="mt-4 inline-block font-display text-xs uppercase tracking-[0.15em] underline-offset-4 group-hover:underline">
                Explore
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
