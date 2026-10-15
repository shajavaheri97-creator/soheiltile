"use server";
import { redirect } from "next/navigation";
import {
  clearFailures, clientIp, createSession, destroySession,
  isRateLimited, recordFailure, verifyPassword,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_: LoginState, fd: FormData): Promise<LoginState> {
  const ip = await clientIp();
  if (isRateLimited(ip)) {
    return { error: "تلاش‌های ناموفق زیاد بود. ۱۵ دقیقه دیگر دوباره امتحان کنید." };
  }
  const password = String(fd.get("password") ?? "");
  if (password.length > 200 || !verifyPassword(password)) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "رمز عبور نادرست است." };
  }
  clearFailures(ip);
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
