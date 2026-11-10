import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="page-top min-h-screen bg-limestone px-6 pb-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <p className="font-display text-sm uppercase tracking-label text-olive">
          About Us
        </p>
        <h1 className="type-title mt-4 max-w-4xl text-ink">
          Get to know Second Nature
        </h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:items-start lg:gap-16">
          <div className="space-y-6 font-body text-lg leading-relaxed text-ink/80">
            <p>
              Second Nature Creative Studio was built for people who want their celebration to feel personal, layered, and unmistakably their own.
            </p>
            <p>
              We specialize in curated wedding rentals, styling, and creative direction — bringing together linens, tabletop pieces, textures, colors, and details in a way that feels thoughtful rather than formulaic.
            </p>
            <p>
              Our approach is rooted in instinct, curiosity, and a strong point of view. We mix new pieces with vintage finds, refined details with unexpected ones, and structure with a little room for surprise.
            </p>
            <p>
              Because the best design does not feel copied from a trend. It feels like you. Design that feels collected, never copied.
            </p>
          </div>
          <div className="relative aspect-[388/348] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/photos/about-church.jpg"
              alt="The founder of Second Nature Creative Studio"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
