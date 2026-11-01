
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function cleanReply(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function focusMessageBox() {
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessage("");
    setLoading(true);
    setStatus("");

    setMessages((current) => [
      ...current,
      { role: "user", content: userMessage },
    ]);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("Please sign in first at /login.");
      setLoading(false);
      focusMessageBox();
      return;
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "Tinker conversation",
      })
      .select()
      .single();

    if (conversationError) {
      setStatus(conversationError.message);
      setLoading(false);
      focusMessageBox();
      return;
    }

    const { error: userMessageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: userMessage,
    });

    if (userMessageError) {
      setStatus(userMessageError.message);
      setLoading(false);
      focusMessageBox();
      return;
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const result = await response.json();

    if (!response.ok) {
      setStatus(result.error || "Something went wrong.");
      setLoading(false);
      focusMessageBox();
      return;
    }

    const assistantReply = cleanReply(result.reply);

    setMessages((current) => [
      ...current,
      { role: "assistant", content: assistantReply },
    ]);

    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "assistant",
      content: assistantReply,
    });

    setStatus("Saved to Supabase.");
    setLoading(false);
    focusMessageBox();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-amber-50 px-4 py-8 sm:px-6">
      <div className="mx-auto flex h-[calc(100vh-4rem)] min-h-0 w-full max-w-2xl flex-col rounded-3xl bg-white shadow-sm">
        <header className="border-b px-6 py-5">
          <p className="text-xs font-bold tracking-[0.3em] text-orange-500">
            TINKER
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-800">
            Let’s explore together
          </h1>
        </header>

        <section className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-amber-50 p-5 text-slate-700">
              Hi! I’m Tinker. What would you like to explore today?
            </div>
          )}

          {messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`flex ${
                item.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-3 leading-7 ${
                  item.role === "user"
                    ? "rounded-br-md bg-slate-800 text-white"
                    : "rounded-bl-md bg-amber-50 text-slate-700"
                }`}
              >
                {item.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-3xl rounded-bl-md bg-amber-50 px-5 py-3 text-slate-500">
                Tinker is thinking…
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        <div className="border-t p-5">
          <textarea
            ref={textareaRef}
            className="w-full resize-none rounded-2xl border border-slate-200 p-4 outline-none focus:border-orange-400"
            rows={3}
            placeholder="Ask Tinker something..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">{status}</p>

            <button
              className="rounded-full bg-slate-800 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={sendMessage}
              disabled={loading || !message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}