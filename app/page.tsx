import Image from "next/image";
import Link from "next/link";

const consultingCollage = [
  "/photos/home-tablet.jpg",
  "/photos/home-bridge.jpg",
  "/photos/home-bookshelf.jpg",
  "/photos/home-phone.jpg",
];

export default function HomePage() {
  return (
    <section className="min-h-screen bg-limestone px-6 pb-24 md:px-16 md:pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[388fr_732fr]">
          <Link href="/about" className="group block">
            <div className="relative aspect-[388/348] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/photos/about-church.jpg"
                alt="About Us"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
                priority
              />
            </div>
            <h2 className="mt-6 font-display text-2xl text-ink">About Us</h2>
            <p className="mt-2 font-body text-ink/70">
              Our approach is rooted in instinct, curiosity, and a strong point of view. Learn more about us.
            </p>
          </Link>

          <Link href="/gatherings" className="group block">
            <div className="relative aspect-[732/348] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src="/photos/rentals-tablescape.jpg"
                alt="Event Rentals"
                fill
                sizes="(min-width: 768px) 67vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
                priority
              />
            </div>
            <h2 className="mt-6 font-display text-2xl text-ink">Event Rentals</h2>
            <p className="mt-2 font-body text-ink/70">
              Beautiful gatherings begin with thoughtful choices. Explore our rental offerings.
            </p>
          </Link>

          <Link href="/studio" className="group block md:col-span-2">
            <div className="relative aspect-[1152/448] overflow-hidden rounded-2xl bg-secondary">
              {/* Four separate photos, laid out like Lydia's original flattened collage (column widths match it). */}
              <div
                role="img"
                aria-label="Creative & Digital Consulting"
                className="grid h-full grid-cols-[596fr_556fr_562fr_590fr] transition duration-500 group-hover:scale-105"
              >
                {consultingCollage.map((src) => (
                  <div key={src} className="relative">
                    <Image src={src} alt="" fill sizes="(min-width: 1280px) 320px, 25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <h2 className="mt-6 font-display text-2xl text-ink">Creative & Digital Consulting</h2>
            <p className="mt-2 font-body text-ink/70">
              Marketing that feels intentional, original, and unmistakably yours.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
