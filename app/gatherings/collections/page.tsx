import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicCollections } from "@/lib/estimator/data";

export const metadata: Metadata = {
  title: "Shop Curated Collections | Second Nature",
  description: "Explore our precurated event-rental collections, then build a personalized estimate.",
};

export default async function CollectionsPage() {
  const collections = await getPublicCollections();
  return (
    <div className="min-h-screen bg-limestone text-ink">
      <section className="page-top px-6 pb-16 text-center md:px-16 md:pb-20">
        <p className="text-xs uppercase tracking-label text-fig">The Second Nature edit</p>
        <h1 className="type-title mt-4">Shop By Collections</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink/65">Begin with a mood, a palette, or a point of view. Every collection is hand selected, and every piece can still be mixed into your own estimate.</p>
      </section>
      <section className="px-6 pb-24 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/gatherings/collections/${collection.slug}`} className="group overflow-hidden rounded-2xl bg-card">
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                {collection.headerImagePath ? <Image src={collection.headerImagePath} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : null}
              </div>
              <div className="p-7">
                <h2 className="type-card">{collection.name}</h2>
                <p className="mt-3 line-clamp-2 leading-7 text-ink/60">{collection.description}</p>
                <p className="mt-5 text-xs uppercase tracking-label text-fig">Explore collection</p>
              </div>
            </Link>
          ))}
          {!collections.length ? <p className="col-span-full rounded-2xl bg-card p-10 text-center text-ink/60">Our first curated collection is coming soon.</p> : null}
        </div>
      </section>
    </div>
  );
}
