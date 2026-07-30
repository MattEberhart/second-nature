"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/gatherings", label: "Gatherings" },
  { href: "/studio", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "top-0 z-50 w-full",
        isHome
          ? "absolute text-limestone"
          : "sticky bg-limestone/90 backdrop-blur text-ink"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-display text-xs uppercase tracking-[0.2em] transition-colors hover:text-olive",
                pathname === link.href && "text-olive"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      {open && (
        <div className="absolute left-0 top-full w-full bg-limestone text-ink shadow md:hidden">
          <nav className="flex flex-col items-center gap-6 py-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-display text-sm uppercase tracking-[0.2em] transition-colors hover:text-olive",
                  pathname === link.href && "text-olive"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
