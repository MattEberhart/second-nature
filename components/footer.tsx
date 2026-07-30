import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-ink text-limestone/80">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs font-body text-sm leading-relaxed">
              The smallest details often tell the biggest stories. Based in
              Charlotte, NC.
            </p>
          </div>
          <div>
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-limestone/60">
              Explore
            </h4>
            <nav className="mt-4 flex flex-col gap-2 font-body text-sm">
              <Link
                href="/gatherings"
                className="transition-colors hover:text-olive"
              >
                Gatherings
              </Link>
              <Link
                href="/studio"
                className="transition-colors hover:text-olive"
              >
                The Studio
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-olive"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="font-display text-xs uppercase tracking-[0.25em] text-limestone/60">
              Connect
            </h4>
            <div className="mt-4 flex flex-col gap-2 font-body text-sm">
              <a
                href="mailto:hello@secondnaturestudio.com"
                className="transition-colors hover:text-olive"
              >
                hello@secondnaturestudio.com
              </a>
              <span>Charlotte, NC</span>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-limestone/10 pt-8 text-center font-display text-[10px] uppercase tracking-[0.2em] text-limestone/40">
          © {new Date().getFullYear()} Second Nature Creative Studio
        </div>
      </div>
    </footer>
  );
}
