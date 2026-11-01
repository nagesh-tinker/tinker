import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-6 text-center text-slate-800">
      <p className="mb-4 text-sm font-bold tracking-[0.35em] text-orange-500">
        TINKER
      </p>

      <h1 className="max-w-2xl text-5xl font-bold tracking-tight sm:text-7xl">
        A curious companion for big questions.
      </h1>

      <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
        Tinker helps children explore ideas, ask questions, and learn through
        thoughtful conversations.
      </p>

      <Link
        href="/login"
        className="mt-8 rounded-full bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
      >
        Start exploring
      </Link>
    </main>
  );
}
