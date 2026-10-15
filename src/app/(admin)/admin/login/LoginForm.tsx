"use client";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-semibold" htmlFor="password">رمز عبور</label>
      <input
        id="password" name="password" type="password" required autoFocus
        autoComplete="current-password" dir="ltr"
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "در حال ورود…" : "ورود"}
      </button>
    </form>
  );
}
