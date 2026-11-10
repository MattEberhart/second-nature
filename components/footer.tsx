import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-limestone text-ink/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row md:px-16">
        <Logo className="w-36 md:w-44" />
        <div className="text-center font-body text-sm md:text-right">
          <a
            href="mailto:hello@secondnaturecreative.com"
            className="transition-colors hover:text-olive"
          >
            hello@secondnaturecreative.com
          </a>
          <p className="mt-1">
            © {new Date().getFullYear()} Second Nature Creative Studio · Based in Charlotte, NC
          </p>
          <nav
            aria-label="Legal"
            className="mt-3 flex items-center justify-center gap-4 md:justify-end"
          >
            <Link
              href="/terms"
              className="underline-offset-4 transition-colors hover:text-olive hover:underline"
            >
              Terms &amp; Services
            </Link>
            <Link
              href="/privacy"
              className="underline-offset-4 transition-colors hover:text-olive hover:underline"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
