import { HomeIcon, BallIcon, TrophyIcon, BookIcon } from "./icons";

export const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/jugar", label: "Jugar", icon: BallIcon },
  { href: "/clasificacion", label: "Ranking", icon: TrophyIcon },
  { href: "/reglas", label: "Reglas", icon: BookIcon },
] as const;
