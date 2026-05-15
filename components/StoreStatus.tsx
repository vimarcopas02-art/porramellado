"use client";

import { useStoreError } from "@/lib/hooks";

/** Banner global que avisa si la capa de datos (Supabase) tiene algún problema. */
export function StoreStatus() {
  const error = useStoreError();
  if (!error) return null;
  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-700">
      Problema con la base de datos: {error}
    </div>
  );
}
