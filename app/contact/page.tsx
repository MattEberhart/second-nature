import { Suspense } from "react";
import { InquiryForm } from "./inquiry-form";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }> | { interest?: string };
}) {
  const params = await searchParams;
  const defaultInterest = params.interest || "";

  return (
    <>
      <section className="bg-limestone px-6 pb-6 pt-20 text-center md:px-16 md:pb-8 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-ink md:text-6xl lg:text-7xl">
            Contact Us
          </h1>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="bg-limestone px-6 py-24 md:px-16">
            <div className="mx-auto max-w-2xl">
              <div className="h-96 animate-pulse rounded-2xl bg-secondary" />
            </div>
          </section>
        }
      >
        <InquiryForm defaultInterest={defaultInterest} />
      </Suspense>

    </>
  );
}
