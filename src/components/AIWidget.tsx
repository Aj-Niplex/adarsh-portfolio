"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LoaderCircle, MessageSquare, Send, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const greeting: ChatMessage = {
  role: "assistant",
  content: "Ask me about the projects: what NiPlex-Harness does, how NiPlex-MCP is built, or which one fits what you need."
};

export function AIWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
    inputRef.current?.focus();
  }, [open, messages, busy]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;

    const updated: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(updated);
    setDraft("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.filter((m) => m !== greeting).slice(-12) })
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) throw new Error(data.error || "The assistant is unavailable right now.");
      setMessages((current) => [...current, { role: "assistant", content: data.reply || "" }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <section className="chat-panel" aria-label="Ask about the projects">
          <header className="chat-head">
            <strong>Ask about the work</strong>
            <button type="button" className="chat-icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </header>
          <div className="chat-log" aria-live="polite">
            <p className="chat-note">Answers come from Google Gemini using public project info only. Do not send passwords, keys or private data.</p>
            {messages.map((m, i) => (
              <div className={"chat-msg " + (m.role === "user" ? "from-user" : "from-ai")} key={i}>
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="chat-msg from-ai">
                <LoaderCircle size={14} className="spin" /> Thinking
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question"
              rows={1}
              maxLength={2000}
              aria-label="Your question"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button type="submit" className="chat-send" aria-label="Send" disabled={busy || !draft.trim()}>
              <Send size={16} />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        className="chat-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask about the work"}
      >
        <MessageSquare size={18} />
        <span>{open ? "Close" : "Ask"}</span>
      </button>
    </>
  );
}
