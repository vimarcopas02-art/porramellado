"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white sm:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors",
                active ? "text-pitch-600" : "text-ink-400",
              )}
            >
              <Icon className="h-6 w-6" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
