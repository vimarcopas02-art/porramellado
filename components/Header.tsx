"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav";
import { BallIcon, UserIcon } from "./icons";
import { useParticipant } from "@/lib/hooks";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const participant = useParticipant();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight text-ink-900"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-pitch-600 text-white">
            <BallIcon className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            Porra <span className="text-pitch-600">Mundial 2026</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-pitch-50 text-pitch-700"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/jugar"
          className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          <UserIcon className="h-4 w-4 text-pitch-600" />
          <span className="max-w-24 truncate">
            {participant ? participant.name : "Entrar"}
          </span>
        </Link>
      </div>
    </header>
  );
}
