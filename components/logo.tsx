import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className="inline-block focus:outline-none"
      aria-label="Second Nature Creative Studio home"
    >
      <div className={cn("relative", className)}>
        <Image
          src="/logo.png"
          alt="Second Nature Creative Studio"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 69px, 200px"
          priority
        />
      </div>
    </Link>
  );
}
