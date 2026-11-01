"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/topics");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-sm"
      >
        <p className="text-sm font-bold tracking-[0.3em] text-orange-500">
          TINKER
        </p>

        <h1 className="text-3xl font-bold text-slate-800">Welcome back</h1>

        <input
          className="w-full rounded-lg border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button
          className="w-full rounded-full bg-slate-800 px-5 py-3 font-semibold text-white"
          type="submit"
        >
          Sign in
        </button>

        <p className="text-sm text-slate-600">{message}</p>
      </form>
    </main>
  );
}
