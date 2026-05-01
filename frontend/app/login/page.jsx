"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { login } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="text-sm font-medium text-slate-500">Team Task Manager</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Log in</h1>
        <p className="mt-2 text-sm text-slate-600">Access your team workspace.</p>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="input-label">Email</span>
            <input
              className="text-input"
              name="email"
              onChange={updateField}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="block">
            <span className="input-label">Password</span>
            <input
              className="text-input"
              minLength={8}
              name="password"
              onChange={updateField}
              required
              type="password"
              value={form.password}
            />
          </label>
        </div>

        <button className="btn-primary mt-6 w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          No account?{" "}
          <Link className="font-medium text-slate-950" href="/signup">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
