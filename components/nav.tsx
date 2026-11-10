"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/studio", label: "Studio" },
];

const gatheringLinks = [
  { href: "/gatherings/estimate", label: "Build Your Estimate" },
  { href: "/gatherings/collections", label: "Shop By Collections" },
  { href: "/consultation", label: "Free Consultation" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="relative z-50 border-b border-ink/5 bg-limestone text-ink">
      <div className="mx-auto flex min-h-[104px] max-w-7xl items-center justify-between px-6 py-3 md:min-h-[144px] md:px-16">
        <Logo className="w-[170px] md:w-[280px]" />

        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 md:gap-10">
          {links.slice(0, 2).map((link) => (
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
          <div className="group relative">
            <Link
              href="/gatherings"
              className={cn(
                "flex items-center gap-1 font-display text-sm uppercase tracking-[0.15em] transition-colors hover:text-olive md:text-xs md:tracking-[0.2em]",
                pathname.startsWith("/gatherings") && "text-olive",
              )}
            >
              Gatherings <ChevronDown className="size-3 transition group-hover:rotate-180 group-focus-within:rotate-180" />
            </Link>
            <div className="invisible absolute right-0 top-full z-50 w-60 translate-y-2 pt-4 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 md:left-1/2 md:right-auto md:-translate-x-1/2 md:group-hover:-translate-x-1/2 md:group-focus-within:-translate-x-1/2">
              <div className="rounded-xl border border-ink/10 bg-card p-2 shadow-xl">
                {gatheringLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block rounded-lg px-4 py-3 text-sm text-ink transition hover:bg-secondary hover:text-fig">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {links.slice(2).map((link) => (
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
