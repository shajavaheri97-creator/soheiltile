import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-brand-700">404</h1>
      <p className="mt-3 text-muted">Page not found · صفحه پیدا نشد</p>
      <Link href="/fa" className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white">فارسی</Link>{" "}
      <Link href="/en" className="mt-6 inline-block rounded-full border border-brand-500 px-6 py-2.5 font-semibold text-brand-700">English</Link>
    </main>
  );
}
