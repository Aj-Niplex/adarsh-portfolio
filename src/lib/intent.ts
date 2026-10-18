// Decides whether a message needs the docs at all. A greeting, a thank-you or a request that
// has nothing to do with the projects gets an instant reply, with no steps and no model call.

export type Intent =
  | { kind: "smalltalk"; reply: string }
  | { kind: "offtopic"; reply: string }
  | { kind: "question" };

const GREETING = /^(hi+|hey+|heya|hello+|helo|hola|namaste|yo+|sup|wassup|what'?s up|good (morning|afternoon|evening|night)|gm|howdy)( there| bro| man| dude| everyone)?$/;
const THANKS = /^(thanks?|thank you|thx|ty|tysm|ok(ay)?|k|cool|nice|great|awesome|got it|understood|alright|perfect|sweet|wow)( a lot| so much| bro| man)?$/;
const BYE = /^(bye+|goodbye|see ya|see you|cya|later|good ?night)( bro| man)?$/;
const HOW_ARE_YOU = /^(how are you|how r u|how are u|how'?s it going|how do you do)( today| doing)?$/;
const ABOUT_ME = /^(who are you|what are you|what can you do|what do you do|help|what can i ask|what should i ask|how does this work|how do you work)$/;

const REPLIES = {
  greeting:
    "Hi! I answer questions about Adarsh's projects: NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP and more. What would you like to know?",
  thanks: "Anytime. Ask about another project whenever you like.",
  bye: "Bye! Come back any time.",
  how: "Doing well, thanks. Want to hear about one of the projects?",
  about:
    "I'm the docs assistant for this site. I can explain what each project does, how it works, how it compares with other tools, and which one fits what you need."
};

export const OFFTOPIC_REPLY =
  "I only cover the projects on this site, so I can't help with that one. Try asking what NiPlex-MCP does, or how NiPlex-Harness keeps code execution safe.";

// Requests that are clearly not about the projects. Only used when no project term was found.
const OFFTOPIC = new RegExp(
  "^(write|generate|compose|draft|translate|solve|calculate|compute|debug|fix|refactor|convert|rewrite|paraphrase)\\b|" +
    "\\b(joke|poem|story|recipe|weather|horoscope|lyrics|homework|essay|bitcoin|crypto price|stock price|sports? score|movie|song|jailbreak)\\b|" +
    "\\b(ignore (all )?(previous|prior|above) (instructions|rules)|system prompt|reveal your (rules|instructions))\\b"
);

function normalise(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function classify(question: string, hasProjectTerms: boolean): Intent {
  const q = normalise(question);
  if (!q) return { kind: "smalltalk", reply: REPLIES.greeting };
  if (q.length <= 40) {
    if (GREETING.test(q)) return { kind: "smalltalk", reply: REPLIES.greeting };
    if (THANKS.test(q)) return { kind: "smalltalk", reply: REPLIES.thanks };
    if (BYE.test(q)) return { kind: "smalltalk", reply: REPLIES.bye };
    if (HOW_ARE_YOU.test(q)) return { kind: "smalltalk", reply: REPLIES.how };
    if (ABOUT_ME.test(q)) return { kind: "smalltalk", reply: REPLIES.about };
  }
  if (!hasProjectTerms && OFFTOPIC.test(q)) return { kind: "offtopic", reply: OFFTOPIC_REPLY };
  return { kind: "question" };
}
