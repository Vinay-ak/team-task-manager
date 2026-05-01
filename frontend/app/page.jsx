import Link from "next/link";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <section className="w-full max-w-2xl">
        <p className="text-sm font-medium text-slate-500">Team Task Manager</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
          Manage team work with clarity.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Authentication is ready. Project and task collaboration features will be added
          step by step after each commit.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary" href="/signup">
            Create account
          </Link>
          <Link className="btn-secondary" href="/login">
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
