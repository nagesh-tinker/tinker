"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Topic = {
  id: string;
  title: string | null;
  created_at: string;
};

const ACTIVE_CONVERSATION_KEY = "tinker_active_conversation";

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTopics() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        setMessage(error.message);
      } else {
        setTopics(data || []);
      }

      setLoading(false);
    }

    loadTopics();
  }, [router]);

  function openTopic(id: string) {
    window.localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    router.push("/chat");
  }

  function startNewTopic() {
    window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    router.push("/chat");
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-orange-500">
              TINKER
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-800">
              What shall we explore?
            </h1>

            <p className="mt-3 text-slate-600">
              Pick up a previous topic or start something new.
            </p>
          </div>

          <button
            onClick={signOut}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </header>

        <button
          onClick={startNewTopic}
          className="mt-10 w-full rounded-3xl bg-slate-800 p-6 text-left text-white shadow-sm transition hover:bg-slate-700"
        >
          <span className="text-2xl">+</span>
          <span className="mt-3 block text-xl font-bold">
            Start something new
          </span>
          <span className="mt-1 block text-slate-300">
            Ask a question, imagine a story, or explore an idea.
          </span>
        </button>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Recent topics</h2>

          {loading && (
            <p className="mt-4 text-slate-500">Loading your topics�</p>
          )}

          {!loading && topics.length === 0 && (
            <p className="mt-4 rounded-2xl bg-white p-6 text-slate-600">
              Your topics will appear here after your first conversation.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => openTopic(topic.id)}
                className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="font-bold text-slate-800">
                  {topic.title || "A Tinker conversation"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {new Date(topic.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
        </section>
      </div>
    </main>
  );
}
