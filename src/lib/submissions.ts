// Rules for the public submissions page. The same checks run in the browser form (as hints)
// and again on the server, and the database has its own length limits as a last guard.

export const KINDS = [
  { id: "idea", label: "Idea", hint: "Something to build" },
  { id: "request", label: "Request", hint: "A tool or feature you want" },
  { id: "feedback", label: "Feedback", hint: "About this site" }
] as const;

export type Kind = (typeof KINDS)[number]["id"];

export const LIMITS = {
  title: { min: 3, max: 80 },
  body: { min: 10, max: 500 },
  author: { max: 40 }
} as const;

export type Submission = {
  id: number;
  kind: Kind;
  title: string;
  body: string;
  author: string | null;
  createdAt: string;
};

export type CleanSubmission = { kind: Kind; title: string; body: string; author: string | null };

// Control characters, zero-width characters and text-direction tricks. Tabs and line breaks stay.
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁩﻿]/g;

const oneLine = (value: string) => value.replace(INVISIBLE, "").replace(/\s+/g, " ").trim();

const multiLine = (value: string) =>
  value
    .replace(INVISIBLE, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const size = (value: string) => Array.from(value).length;

const LINK = /\b(?:https?:\/\/|ftp:\/\/|www\.)\S+|\b[a-z0-9][a-z0-9-]*\.(?:com|net|org|io|dev|app|xyz|info|biz|ru|cn|top|site|online|link|click|gg|page|store|shop|live|cloud|tech)\b/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE = /\d{10,}|\+\d[\d\s().-]{8,}\d|(?:^|\D)\d{5}[\s-]\d{5}(?:\D|$)/;
const SHOUTING = /(.)\1{9,}|(\b\w+\b)(?:\s+\2){4,}/iu;
const NAME = /^[\p{L}\p{N} .'_-]+$/u;

function problem(text: string): string | null {
  if (EMAIL.test(text)) return "Email addresses are not accepted.";
  if (PHONE.test(text)) return "Phone numbers are not accepted.";
  if (LINK.test(text)) return "Links are not accepted. Describe it in words instead.";
  if (SHOUTING.test(text)) return "That looks like spam. Please write it out normally.";
  return null;
}

export type Checked = { ok: true; value: CleanSubmission } | { ok: false; error: string };

export function checkSubmission(input: { kind?: unknown; title?: unknown; body?: unknown; author?: unknown }): Checked {
  const kind = KINDS.find((k) => k.id === input.kind)?.id;
  if (!kind) return { ok: false, error: "Pick Idea, Request or Feedback." };

  const title = typeof input.title === "string" ? oneLine(input.title) : "";
  if (size(title) < LIMITS.title.min || size(title) > LIMITS.title.max || !/\p{L}{2}/u.test(title)) {
    return { ok: false, error: "Give it a title of " + LIMITS.title.min + " to " + LIMITS.title.max + " characters." };
  }

  const body = typeof input.body === "string" ? multiLine(input.body) : "";
  if (size(body) < LIMITS.body.min || size(body) > LIMITS.body.max || !/\p{L}{2}/u.test(body)) {
    return { ok: false, error: "Describe it in " + LIMITS.body.min + " to " + LIMITS.body.max + " characters." };
  }

  let author: string | null = null;
  if (typeof input.author === "string" && input.author.trim() !== "") {
    author = oneLine(input.author);
    if (size(author) > LIMITS.author.max || !NAME.test(author)) {
      return { ok: false, error: "Use up to " + LIMITS.author.max + " letters, numbers or spaces for the name, or leave it empty." };
    }
  }

  const found = problem(title) || problem(body) || (author ? problem(author) : null);
  if (found) return { ok: false, error: found };

  return { ok: true, value: { kind, title, body, author } };
}

/** What the database returns, turned into what the page shows. */
export function toSubmission(row: unknown): Submission | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const kind = KINDS.find((k) => k.id === r.kind)?.id;
  if (typeof r.id !== "number" || !kind || typeof r.title !== "string" || typeof r.body !== "string") return null;
  return {
    id: r.id,
    kind,
    title: r.title,
    body: r.body,
    author: typeof r.author === "string" && r.author ? r.author : null,
    createdAt: typeof r.created_at === "string" ? r.created_at : typeof r.createdAt === "string" ? r.createdAt : ""
  };
}

/** A fixed format in UTC so the server page and the browser always print the same text. */
export function formatDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
