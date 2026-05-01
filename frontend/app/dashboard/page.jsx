"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, logout } from "../../lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(err.message);
        logout();
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (isLoading) {
    return <main className="center-shell">Loading your workspace...</main>;
  }

  if (error) {
    return <main className="center-shell text-red-600">{error}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Team Task Manager</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">
              Welcome, {user?.name}
            </h1>
          </div>
          <button className="btn-secondary w-full sm:w-auto" onClick={handleLogout}>
            Log out
          </button>
        </header>

        <div className="grid flex-1 place-items-center py-12">
          <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Authentication is ready</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your account is protected by JWT authentication. Project, task, dashboard,
              role, activity log, and comment features will be added in the next committed
              steps.
            </p>
            <div className="mt-6 rounded-md bg-slate-100 p-4 text-sm text-slate-700">
              Signed in as <span className="font-medium">{user?.email}</span>
            </div>
            <Link className="mt-6 inline-flex text-sm font-medium text-slate-950" href="/">
              Back to start
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
