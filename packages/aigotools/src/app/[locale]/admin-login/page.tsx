import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppConfig } from "@/lib/config";

export default function AdminLogin({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  async function login(formData: FormData) {
    "use server";

    const password = String(formData.get("password") || "");

    if (password !== AppConfig.localAdminPassword) {
      redirect("/admin-login?error=1");
    }

    cookies().set("saasDanceLocalAdmin", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    redirect("/dashboard/review-manage");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-primary-900">Admin Login</h1>
      <p className="mt-2 text-primary-500">
        Enter the local admin password to review submitted tools.
      </p>
      <form action={login} className="mt-8 rounded-lg border border-primary-200 p-4">
        <label className="block text-sm font-semibold text-primary-700">
          Password
          <input
            className="mt-2 h-11 w-full rounded-md border border-primary-200 bg-background px-3 text-primary-900 outline-none focus:border-primary"
            name="password"
            type="password"
          />
        </label>
        {searchParams?.error && (
          <p className="mt-3 text-sm font-medium text-danger">
            Incorrect password.
          </p>
        )}
        <button
          className="mt-4 h-11 w-full rounded-md bg-primary px-4 font-bold text-primary-foreground"
          type="submit"
        >
          Log in
        </button>
      </form>
    </main>
  );
}
