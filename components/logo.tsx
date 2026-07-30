import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-block focus:outline-none", className)}
      aria-label="Second Nature Creative Studio home"
    >
      <div className="relative h-20 w-60 md:h-24 md:w-80">
        <Image
          src="/logo.png"
          alt="Second Nature Creative Studio"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 176px, 224px"
          priority
        />
      </div>
    </Link>
  );
}
