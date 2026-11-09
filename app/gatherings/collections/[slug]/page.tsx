import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EstimateBuilder } from "@/components/estimate/estimate-builder";
import { getPublicCatalog, getPublicCollection } from "@/lib/estimator/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPublicCollection(slug);
  if (!collection) return {};
  return { title: `${collection.name} | Second Nature`, description: collection.description };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [collection, catalog] = await Promise.all([getPublicCollection(slug), getPublicCatalog()]);
  if (!collection) notFound();
  const gallery = collection.images.length ? collection.images : collection.headerImagePath ? [{ id: "header", imagePath: collection.headerImagePath, altText: "" }] : [];
  return (
    <div className="bg-limestone">
      <section className="px-6 pt-12 md:px-16 md:pt-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
          {gallery.slice(0, 3).map((image, index) => (
            <div key={image.id} className={`relative overflow-hidden rounded-2xl bg-secondary ${index === 0 ? "aspect-[16/10] md:col-span-2" : "aspect-[4/3]"}`}>
              <Image src={image.imagePath} alt={image.altText} fill sizes={index === 0 ? "100vw" : "50vw"} priority={index === 0} className="object-cover" />
            </div>
          ))}
        </div>
      </section>
      <EstimateBuilder products={collection.products} catalog={catalog} heading={collection.name} eyebrow="Lydia’s curated collection" intro={collection.description} />
    </div>
  );
}
