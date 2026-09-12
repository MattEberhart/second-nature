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
    <header className="relative z-50 border-b border-ink/5 bg-limestone text-ink">
      <div className="mx-auto flex min-h-[88px] max-w-7xl items-center justify-between px-6 py-3 md:min-h-[112px] md:px-16">
        <Logo className="h-[64px] w-[64px] md:h-[96px] md:w-[96px]" />

        <nav className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-display text-sm uppercase tracking-[0.15em] transition-colors hover:text-olive md:text-xs md:tracking-[0.2em]",
                pathname === link.href && "text-olive",
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
