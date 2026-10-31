import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content", "km");

export function readJson<T = unknown>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8")) as T;
}

export function readText(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

export type MdFile = { meta: Record<string, unknown>; body: string };

/** The data files carry a small header of `key: value` lines, each value written as JSON. */
export function readMd(rel: string): MdFile {
  const raw = readText(rel);
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, unknown> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(": ");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 2).trim();
    try {
      meta[key] = JSON.parse(val);
    } catch {
      meta[key] = val;
    }
  }
  return { meta, body: m[2].trim() };
}

export type KmMeta = { ref: string; read_on: string; counts: Record<string, number>; python_min: string };
export const kmMeta = (): KmMeta => readJson<KmMeta>("meta.json");
