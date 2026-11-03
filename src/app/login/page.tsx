"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/http";
import { useAuthStore } from "@/lib/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/");
  }, [hydrated, isAuthenticated, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 403
            ? "Staff access required. This account is not marked as staff."
            : err.message
          : "Unable to sign in";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(99,102,241,0.18), transparent 45%), radial-gradient(ellipse at 85% 80%, rgba(14,165,233,0.15), transparent 50%)",
        }}
      />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-white p-8 shadow-[var(--shadow-modal)]"
      >
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #0EA5E9 55%, #F59E0B 100%)",
            }}
          >
            B
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-ink">Bresomilan</p>
            <p className="text-xs font-semibold text-muted">Staff sign in</p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-muted">
          Sign in with a staff account to open the operations console.
        </p>

        <label className="ui-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@bresomilan.com"
          className="ui-input mb-4"
        />

        <label className="ui-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="ui-input mb-6"
        />

        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in to admin"}
        </Button>
      </form>
    </div>
  );
}
