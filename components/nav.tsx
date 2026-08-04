"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/studio", label: "Studio" },
  { href: "/gatherings", label: "Gatherings" },
  { href: "/contact", label: "Contact Us" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-limestone/95 text-ink backdrop-blur">
      <div className="mx-auto flex h-auto min-h-[120px] max-w-7xl items-start justify-between px-6 py-4 md:min-h-[220px] md:items-center md:px-16 md:py-2">
        <Logo className="h-[69px] w-[69px] md:h-[200px] md:w-[200px]" />

        <nav className="flex flex-col items-end gap-1 pt-2 md:flex-row md:items-center md:gap-10 md:pt-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-display text-sm uppercase tracking-[0.15em] transition-colors hover:text-olive md:text-xs md:tracking-[0.2em]",
                pathname === link.href && "text-olive"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
