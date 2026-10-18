export type ChatEvent =
  | { type: "step"; id: string; label: string; detail?: string; status: "running" | "done" }
  | { type: "sources"; items: Array<{ title: string; url: string }>; links: string[] }
  | { type: "token"; text: string }
  | { type: "done"; usage: { limit: number; remaining: number; signedIn: boolean } }
  | { type: "error"; message: string };

export type SessionInfo = {
  available: boolean;
  signedIn: boolean;
  email?: string;
  limit: number;
};
