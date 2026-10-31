// Pictures for the Kaizen Manas pages are stored as scrambled files in public/km, not as image
// files. The browser fetches the bytes, unscrambles them and paints them onto a canvas, so there is
// no picture address to save and "Save image as" has nothing to save. This keeps casual copying
// out. It cannot stop a screenshot, and someone who reads this code can undo it.
import { KM_IMAGE_SIZES } from "./kmImageData";

export type KmMode = "funny" | "simple";

const M32 = 0xffffffff;

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function hex8(n: number) {
  return n.toString(16).padStart(8, "0");
}

export function kmFileName(id: string, mode: KmMode) {
  return hex8(fnv(id + "|" + mode + "|a")) + hex8(fnv(id + "|" + mode + "|b"));
}

export function kmUnscramble(data: Uint8Array, id: string, mode: KmMode) {
  let st = fnv(id + "|" + mode + "|k") || 1;
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    st = (st ^ (st << 13)) & M32;
    st = (st ^ (st >>> 17)) & M32;
    st = (st ^ (st << 5)) & M32;
    out[i] = data[i] ^ (st & 255);
  }
  return out;
}

export function kmImageSize(id: string) {
  return KM_IMAGE_SIZES[id] || { w: 1200, h: 900 };
}

export function kmHasImage(id: string) {
  return id in KM_IMAGE_SIZES;
}
