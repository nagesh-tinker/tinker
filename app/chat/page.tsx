"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function saveMessage() {
    if (!message.trim()) return;

    setStatus("Saving...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("Please sign in first at /login.");
      return;
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "My first Tinker conversation",
      })
      .select()
      .single();

    if (conversationError) {
      setStatus(conversationError.message);
      return;
    }

    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: message,
    });

    setStatus(messageError ? messageError.message : "Message saved to Supabase.");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">Tinker chat</h1>

        <textarea
          className="mt-6 w-full rounded-lg border p-3"
          rows={4}
          placeholder="Ask Tinker something..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <button
          className="mt-4 rounded-full bg-slate-800 px-5 py-3 font-semibold text-white"
          onClick={saveMessage}
        >
          Save message
        </button>

        <p className="mt-4 text-sm text-slate-600">{status}</p>
      </div>
    </main>
  );
}
