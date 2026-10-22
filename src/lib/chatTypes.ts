export type ChatEvent =
  | { type: "step"; id: string; label: string; detail?: string; status: "running" | "done" }
  | { type: "sources"; items: Array<{ title: string; url: string }>; links: string[] }
  | { type: "token"; text: string }
  | { type: "done"; usage: { limit: number; remaining: number | null; signedIn: boolean }; cut?: boolean }
  | { type: "error"; message: string }
  /** Sent every few seconds while a model is thinking, so a quiet connection is not mistaken for a dead one. */
  | { type: "ping" };

export type SessionInfo = {
  available: boolean;
  signedIn: boolean;
  email?: string;
  limit: number;
};
