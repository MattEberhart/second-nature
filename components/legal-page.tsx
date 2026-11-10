import type { ReactNode } from "react";

type LegalSection = {
  heading: string;
  paragraphs?: ReactNode[];
  items?: ReactNode[];
};

export function LegalPage({
  title,
  description,
  details,
  sections,
}: {
  title: string;
  description?: ReactNode;
  details?: { label: string; value: string }[];
  sections: LegalSection[];
}) {
  return (
    <section className="page-top bg-limestone px-6 pb-24 text-ink md:px-16 md:pb-28">
      <article className="mx-auto max-w-3xl">
        <p className="font-display text-sm uppercase tracking-label text-olive">
          Legal
        </p>
        <h1 className="type-title mt-4">{title}</h1>
        {description ? (
          <p className="mt-6 text-base leading-7 text-ink/65">{description}</p>
        ) : null}
        {details ? (
          <dl className="mt-8 grid gap-3 border-y border-ink/10 py-6 text-sm sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt className="font-medium uppercase tracking-label text-ink/50">
                  {detail.label}
                </dt>
                <dd className="mt-1 text-ink/75">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-10 border-t border-ink/10" />
        )}

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="type-card">
                {section.heading}
              </h2>
              {section.paragraphs ? (
                <div className="mt-4 space-y-4 font-body leading-7 text-ink/75">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {section.items ? (
                <ul className="mt-4 list-disc space-y-3 pl-5 font-body leading-7 text-ink/75 marker:text-olive-dark">
                  {section.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}
