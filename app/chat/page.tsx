"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ACTIVE_CONVERSATION_KEY = "tinker_active_conversation";

function cleanReply(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversation() {
      const savedConversationId = window.localStorage.getItem(
        ACTIVE_CONVERSATION_KEY,
      );

      if (!savedConversationId) {
        setLoadingHistory(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingHistory(false);
        return;
      }

      const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", savedConversationId)
        .eq("user_id", user.id)
        .single();

      if (!conversation) {
        window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
        setLoadingHistory(false);
        return;
      }

      const { data: savedMessages } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", savedConversationId)
        .order("created_at", { ascending: true });

      setConversationId(savedConversationId);
      setMessages(
        (savedMessages || []).filter(
          (item): item is ChatMessage =>
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string",
        ),
      );

      setLoadingHistory(false);
    }

    loadConversation();
  }, []);

  useEffect(() => {
    if (!loading && !loadingHistory) {
      textareaRef.current?.focus();
    }
  }, [loading, loadingHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function startNewTopic() {
    window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    setConversationId(null);
    setMessages([]);
    setMessage("");
    setStatus("Started a new topic.");
    textareaRef.current?.focus();
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
      return;
    }

    let activeConversationId: string;

if (conversationId) {
  activeConversationId = conversationId;
} else {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: userMessage.slice(0, 50),
        })
        .select()
        .single();

      if (error || !conversation) {
        setStatus(error?.message || "Could not create a conversation.");
        setLoading(false);
        return;
      }

      activeConversationId = conversation.id;
      setConversationId(activeConversationId);
      window.localStorage.setItem(
        ACTIVE_CONVERSATION_KEY,
        activeConversationId,
      );
    }

    const { error: userMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        role: "user",
        content: userMessage,
      });

    if (userMessageError) {
      setStatus(userMessageError.message);
      setLoading(false);
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
      return;
    }

    const assistantReply = cleanReply(result.reply);

    setMessages((current) => [
      ...current,
      { role: "assistant", content: assistantReply },
    ]);

    await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      role: "assistant",
      content: assistantReply,
    });

    setStatus("Saved to Supabase.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-amber-50 px-4 py-8 sm:px-6">
      <div className="mx-auto flex h-[calc(100vh-4rem)] min-h-0 w-full max-w-2xl flex-col rounded-3xl bg-white shadow-sm">
        <header className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-orange-500">
              TINKER
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              Let’s explore together
            </h1>
          </div>

          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={startNewTopic}
          >
            New topic
          </button>
        </header>

        <section className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          {loadingHistory && (
            <div className="text-center text-sm text-slate-500">
              Loading your conversation…
            </div>
          )}

          {!loadingHistory && messages.length === 0 && (
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
            disabled={loading || loadingHistory}
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">{status}</p>

            <button
              className="rounded-full bg-slate-800 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={sendMessage}
              disabled={loading || loadingHistory || !message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}