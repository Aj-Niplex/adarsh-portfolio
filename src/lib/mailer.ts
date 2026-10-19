// Sends the sign-in code by email. One provider is picked from the environment; if none is
// configured, sign-in stays switched off instead of failing halfway through.
import fs from "node:fs";

type Mail = { to: string; subject: string; text: string; html: string };
type Provider = "agentmail" | "resend" | "brevo" | "debug";

const env = process.env;
const isProd = env.NODE_ENV === "production";

function pickProvider(): Provider | null {
  if (env.AGENTMAIL_API_KEY && env.AGENTMAIL_INBOX) return "agentmail";
  if (env.RESEND_API_KEY && env.MAIL_FROM) return "resend";
  if (env.BREVO_API_KEY && env.MAIL_FROM) return "brevo";
  // Local testing only: write the message to a file instead of sending it.
  if (!isProd && env.MAIL_DEBUG_FILE) return "debug";
  return null;
}

const provider = pickProvider();

export const mailConfigured = provider !== null;

function parseFrom(from: string) {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return match ? { name: match[1].replace(/^"|"$/g, "") || undefined, email: match[2] } : { name: undefined, email: from.trim() };
}

async function post(url: string, headers: Record<string, string>, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(9000)
  });
  return response.ok;
}

export async function sendMail(mail: Mail): Promise<boolean> {
  try {
    switch (provider) {
      case "agentmail":
        return await post(
          "https://api.agentmail.to/v0/inboxes/" + encodeURIComponent(env.AGENTMAIL_INBOX!) + "/messages/send",
          { authorization: "Bearer " + env.AGENTMAIL_API_KEY },
          { to: mail.to, subject: mail.subject, text: mail.text, html: mail.html }
        );
      case "resend":
        return await post(
          "https://api.resend.com/emails",
          { authorization: "Bearer " + env.RESEND_API_KEY },
          { from: env.MAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html }
        );
      case "brevo": {
        const from = parseFrom(env.MAIL_FROM!);
        return await post(
          "https://api.brevo.com/v3/smtp/email",
          { "api-key": env.BREVO_API_KEY! },
          { sender: from, to: [{ email: mail.to }], subject: mail.subject, textContent: mail.text, htmlContent: mail.html }
        );
      }
      case "debug":
        fs.appendFileSync(env.MAIL_DEBUG_FILE!, JSON.stringify(mail) + "\n");
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/** The one message this site sends: a six-digit sign-in code. It contains no links. */
export function codeEmail(to: string, code: string, minutes: number): Mail {
  const spaced = code.slice(0, 3) + " " + code.slice(3);
  const text =
    "Your AJ NiPlex sign-in code is " + spaced + ".\n\n" +
    "It works for " + minutes + " minutes. If you did not ask for it, you can ignore this email; nothing happens until the code is used.\n";
  const html =
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#111">' +
    '<p style="margin:0 0 12px;font-size:15px">Your AJ NiPlex sign-in code:</p>' +
    '<p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:6px">' + spaced + "</p>" +
    '<p style="margin:0;font-size:13px;color:#555">It works for ' + minutes + " minutes. If you did not ask for it, you can ignore this email; nothing happens until the code is used.</p>" +
    "</div>";
  return { to, subject: "Your AJ NiPlex sign-in code: " + spaced, text, html };
}
