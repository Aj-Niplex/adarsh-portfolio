"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Bot, LoaderCircle, Send, Sparkles, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const greeting: ChatMessage = {
  role: "assistant",
  content: "Hey, I'm the tiny assistant for this portfolio. Ask about the projects, their status, or how the tools fit together."
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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
        body: JSON.stringify({ messages: updated.filter((message) => message !== greeting).slice(-12) })
      });
      const data = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "The assistant is taking a breather. Try again soon.");
      }
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
        <section className="ai-panel" aria-label="Portfolio AI assistant">
          <header className="ai-panel-header">
            <div className="ai-avatar"><Bot size={19} /></div>
            <div className="ai-title-wrap">
              <strong>NiPlex assistant</strong>
              <span><i className="status-dot" /> Portfolio guide · Gemini when configured</span>
            </div>
            <button className="icon-button ai-close" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={18} />
            </button>
          </header>

          <div className="ai-messages" aria-live="polite">
            <div className="ai-intro-note">Messages are sent to Google Gemini when enabled; Google’s free tier may use submitted content to improve products. Ask about public projects only, and never share passwords, API keys, or private data.</div>
            {messages.map((message, index) => (
              <div className={"ai-message " + (message.role === "user" ? "from-user" : "from-ai")} key={index}>
                {message.content}
              </div>
            ))}
            {busy && <div className="ai-message from-ai typing"><LoaderCircle size={14} className="spin" /> Thinking through it…</div>}
            <div ref={bottomRef} />
          </div>

          <form className="ai-composer" onSubmit={sendMessage}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask something about the work…"
              rows={1}
              maxLength={2000}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              aria-label="Message the portfolio assistant"
            />
            <button type="submit" className="send-button" aria-label="Send message" disabled={busy || !draft.trim()}>
              {busy ? <LoaderCircle size={17} className="spin" /> : <Send size={17} />}
            </button>
          </form>
          <div className="ai-footer"><Sparkles size={12} /> Replies use Gemini when configured. <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noreferrer">API details <ArrowUpRight size={11} /></a></div>
        </section>
      )}

      <button
        className={"ai-fab " + (open ? "is-open" : "")}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <span className="fab-face"><Sparkles size={21} /></span>}
        <span className="fab-label">{open ? "Close" : "Ask AI"}</span>
      </button>
    </>
  );
}
