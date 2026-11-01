"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Memory = {
  id: string;
  category: string;
  memory: string;
  confidence: number;
  status: "candidate" | "approved" | "dismissed";
  created_at: string;
};

export default function MemoryPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMemories() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("child_memories")
        .select("id, category, memory, confidence, status, created_at")
        .eq("user_id", user.id)
        .neq("status", "dismissed")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setMemories(data || []);
      }

      setLoading(false);
    }

    loadMemories();
  }, [router]);

  async function forgetMemory(id: string) {
    const { error } = await supabase
      .from("child_memories")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMemories((current) => current.filter((memory) => memory.id !== id));
  }

  async function clearMemories() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("child_memories")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMemories([]);
  }

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-orange-500">
              TINKER
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-800">
              What Tinker remembers
            </h1>
          </div>

          <Link
            href="/topics"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ? Topics
          </Link>
        </header>

        <p className="mt-5 max-w-xl leading-7 text-slate-600">
          These memories help Tinker make conversations more personal. You can
          remove anything you do not want Tinker to remember.
        </p>

        {loading && (
          <p className="mt-8 text-slate-500">Loading memories…</p>
        )}

        {!loading && memories.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            Tinker has not saved any memories yet.
          </div>
        )}

        <div className="mt-8 space-y-4">
          {memories.map((memory) => (
            <article
              key={memory.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold capitalize text-orange-500">
                    {memory.category.replace("_", " ")}
                  </p>

                  <p className="mt-2 text-lg text-slate-800">
                    {memory.memory}
                  </p>

                  <p className="mt-2 text-xs capitalize text-slate-500">
                    {memory.status}
                  </p>
                </div>

                <button
                  onClick={() => forgetMemory(memory.id)}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Forget this
                </button>
              </div>
            </article>
          ))}
        </div>

        {memories.length > 0 && (
          <button
            onClick={clearMemories}
            className="mt-8 rounded-full bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
          >
            Clear all memories
          </button>
        )}

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </div>
    </main>
  );
}

