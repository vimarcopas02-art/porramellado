import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-ink-500">
        <p className="font-semibold text-ink-700">Porra Mundial 2026</p>
        <p className="mt-1 max-w-2xl">
          Web de porras entre amigos con fines de entretenimiento. No gestiona
          apuestas, botes ni premios económicos. No está afiliada a la FIFA ni a
          ninguna organización oficial; no utiliza marcas, escudos ni logotipos
          oficiales.
        </p>
        <div className="mt-3 flex gap-4">
          <Link href="/reglas" className="font-semibold hover:text-ink-800">
            Reglas
          </Link>
          <Link href="/admin" className="font-semibold hover:text-ink-800">
            Administración
          </Link>
        </div>
      </div>
    </footer>
  );
}
