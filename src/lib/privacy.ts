// The Privacy Policy. One source for the page at /privacy and for its Markdown copy, so the two
// always agree. Text may contain [label](/path) links.

export const PRIVACY_UPDATED = "1 November 2026";

export const PRIVACY_LEAD =
  "This site is a portfolio with a documentation assistant, a newsletter, a sign-up and a place to send ideas. This page says what each of them keeps, who else handles it, and how to have it removed.";

export type PolicyBlock = { t: "p"; text: string } | { t: "list"; items: string[] };
export type PolicySection = { id: string; title: string; blocks: PolicyBlock[] };

export const PRIVACY: PolicySection[] = [
  {
    id: "short",
    title: "The short version",
    blocks: [
      {
        t: "list",
        items: [
          "Reading the pages needs no account and gives nothing away beyond what any website sees.",
          "Everything below is used only to run the site: to answer questions, send what you asked for, keep the visit counter honest, protect the site from abuse and see which questions people ask so the docs can improve.",
          "Your IP address is not stored. Where it is needed (limits, counting different visitors) only a one-way hash of it is kept.",
          "Nothing is sold, and nothing is used for advertising or tracking across other sites."
        ]
      }
    ]
  },
  {
    id: "who",
    title: "Who is responsible",
    blocks: [
      {
        t: "p",
        text: "Adarsh Jaiswal (AJ NiPlex), an independent developer in India, runs this site. To ask a question or ask for something to be removed, write through the [GitHub profile](https://github.com/Aj-Niplex)."
      }
    ]
  },
  {
    id: "collected",
    title: "What is kept, and why",
    blocks: [
      {
        t: "list",
        items: [
          "Visit counter. One number counts the browsers that visit. A browser is counted once and remembered with a cookie and a note in its own storage, so the number does not grow when you come back. Nothing about you is stored with the number.",
          "The assistant. When you ask the assistant something, your question (up to 600 characters) is sent to Google's Gemini service to write the answer, together with the pages of this site that match it. Do not type passwords, keys or private details into it. The question is also kept in a log with its topic, the AI model that answered, the time, the country, region and city your connection appears to come from, the kind of device (phone, tablet, computer) and a hashed visitor id.",
          "Every call to the service behind the site (the assistant, sign-in, newsletter, ideas and the counter) is logged the same way, without the question: the route, the time, whether it worked, the approximate place and the device type.",
          "Limits. To stop abuse, the number of questions and sign-in codes per minute or hour is counted against a one-way hash of your network address (and of your email, if you signed in). The address itself is not stored.",
          "Sign-up and sign-in. Your email address, the wording you agreed to and the dates, a hash of the 6-digit code that is emailed to you (the code itself is not kept), and a hash of your password (the password itself is never stored or logged).",
          "Newsletter. Your email address, the exact wording you agreed to, whether it was confirmed, and the dates. Emails you receive are product updates and promotions about the projects, and only if you agreed.",
          "Ideas and feedback. What you type on the [submit page](/submit): the kind, a title, a description and an optional name. They are shown on that page for everyone to read, so do not include anything private. Links, email addresses and phone numbers are not accepted."
        ]
      }
    ]
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    blocks: [
      { t: "p", text: "The site uses only its own cookies and storage, and no advertising or analytics cookies:" },
      {
        t: "list",
        items: [
          "pf_consent (cookie, 1 year): remembers that you agreed to this policy, so the question is not asked on every page.",
          "counted (cookie, 1 year): marks a browser that the visit counter already counted. A note in the browser's own storage does the same for 30 days.",
          "pf_session (cookie, 30 days): keeps you signed in. It is signed, readable only by the server, and removed when you sign out.",
          "pf_verified (cookie, 15 minutes): proves that you just entered the right emailed code, so you can choose a password.",
          "theme and mode (browser storage): the visual style and the Day or Dark choice you made in the header.",
          "A short-lived note in the browser's storage that remembers whether the assistant is available."
        ]
      }
    ]
  },
  {
    id: "others",
    title: "Who else handles data",
    blocks: [
      {
        t: "list",
        items: [
          "Vercel hosts the site and the service behind it. Like any host, it sees the requests that reach it, including IP addresses, under its own privacy policy.",
          "Supabase holds the database where the log, accounts, newsletter list, ideas and counters are kept.",
          "Google receives the questions you ask the assistant, to write the answers.",
          "An email service delivers the sign-in and confirmation emails, so it handles the address it sends to and the message."
        ]
      }
    ]
  },
  {
    id: "retention",
    title: "How long it is kept",
    blocks: [
      {
        t: "list",
        items: [
          "The request and question log is deleted after 90 days.",
          "Limit counters (a hashed key and a count) are deleted within a few days.",
          "Sign-in codes expire after 10 minutes and are cleared out a day later.",
          "Your email on the newsletter list or in an account is kept until you remove it.",
          "Ideas and feedback stay on the page until they are taken down."
        ]
      }
    ]
  },
  {
    id: "choices",
    title: "Your choices",
    blocks: [
      {
        t: "list",
        items: [
          "Leave the list: type your address at [/unsubscribe](/unsubscribe). It is taken off at once, with no account and no code. It only stops the emails; an account, if you made one, stays.",
          "Delete your email and account: when you are signed in, the chat window has a Delete my email button. It removes the account, any pending codes and the newsletter entry.",
          "Remove an idea or a question from the log, or ask what is held about you: write through the GitHub profile above.",
          "Cookies: you can delete them in your browser at any time. The site then asks about this policy again on your next visit. The visit counter may count the browser once more.",
          "If you choose No, thanks in the privacy notice, you leave the site and nothing is set."
        ]
      }
    ]
  },
  {
    id: "children",
    title: "Children",
    blocks: [{ t: "p", text: "The site is meant for adults and developers. It does not knowingly collect information from children." }]
  },
  {
    id: "changes",
    title: "Changes to this page",
    blocks: [{ t: "p", text: "If what the site keeps changes, this page is updated first and the date at the top changes with it." }]
  }
];
