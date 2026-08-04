import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-limestone text-ink/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row md:px-16">
        <Logo className="h-12 w-32 md:h-14 md:w-40" />
        <p className="text-center font-body text-sm md:text-right">
          © {new Date().getFullYear()} Second Nature Creative Studio
          <br className="md:hidden" />
          <span className="hidden md:inline"> · </span>
          Based in Charlotte, NC
        </p>
      </div>
    </footer>
  );
}
