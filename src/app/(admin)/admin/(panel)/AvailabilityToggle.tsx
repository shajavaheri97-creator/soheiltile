"use client";
import { useOptimistic, useTransition } from "react";
import { toggleAvailability } from "./actions";

export default function AvailabilityToggle({ id, available }: { id: number; available: boolean }) {
  const [, start] = useTransition();
  const [value, setValue] = useOptimistic(available);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => start(async () => { setValue(!value); await toggleAvailability(id, !value); })}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold transition ${
        value ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${value ? "bg-emerald-500" : "bg-rose-500"}`} />
      {value ? "موجود" : "ناموجود"}
    </button>
  );
}
