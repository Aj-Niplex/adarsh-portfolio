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
// "What can you do for me", "how can you help", "who are you", "what is this" and the many ways to say them.
const ABOUT_ME = new RegExp(
  [
    "^(?:help|help me|hlp|menu|start|options|commands|features|capabilities|about|about you|info)$",
    // what can you do / what do you do / what you can do for me / what are you able to do / what can this chat do
    "\\b(?:what|wat|wht) (?:can|could|do|does|will|would|are|r|is) (?:you|u|ya|yu|this|this chat|this bot|this assistant|the bot|the assistant)(?: really| actually| even| exactly| all)? (?:do|help|know|answer|offer|cover|handle|support|able|capable|good at|for|about)\\b",
    "\\b(?:what|wat|wht) (?:you|u|ya) (?:can|could) (?:do|help|answer|offer)\\b",
    // what can I ask / what should I ask / what to ask
    "\\b(?:what|wat) (?:can|could|should|do|to) (?:i |we )?(?:ask|say|try|type)\\b",
    // how can you help / how does this work / how to use you
    "\\bhow (?:can|could|do|will|would|may) (?:you|u|ya|this|this chat|this bot) (?:help|work|assist|be used|be useful)\\b",
    "\\bhow (?:does|do) (?:this|you|it|the chat|the bot) work\\b",
    "\\bhow (?:to|do i|can i|should i) (?:use|ask|talk to|chat with) (?:this|you|it|the chat|the bot)\\b",
    "\\b(?:can|could|will|would) (?:you|u|ya) (?:help|assist)(?: me)?(?: out)?(?: here| please| pls)?$",
    // who are you / what are you / what is this
    "\\b(?:who|what) (?:are|r|is) (?:you|u|ya)$",
    "\\b(?:what|whats|what's) (?:is )?(?:this|this chat|this bot|here)$",
    "\\bwho (?:made|built|created) (?:you|u|this)\\b",
    "\\b(?:tell|show) me (?:about|more about) (?:yourself|you|this chat|this bot)\\b",
    "\\bintroduce (?:yourself|urself)\\b",
    "\\b(?:your|ur|ya) (?:features|capabilities|abilities|skills|purpose|job|role)\\b",
    "\\bwhat (?:do|does) (?:you|u|this) (?:know|cover|support)\\b",
    "\\b(?:i )?(?:need|want) (?:some )?help$",
    "\\bwhat(?: is|s|'s) the (?:point|purpose|use) of (?:this|you)\\b"
  ].join("|")
);

const REPLIES = {
  greeting:
    "Hi! I answer questions about Adarsh's projects: NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP and more. What would you like to know?",
  thanks: "Anytime. Ask about another project whenever you like.",
  bye: "Bye! Come back any time.",
  how: "Doing well, thanks. Want to hear about one of the projects?",
  about: [
    "I'm the docs assistant for this site. I read the project docs first, then answer from them. Here is what I can do for you:",
    "",
    "- **Explain a project.** What NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP and the other projects do, how they work, and how far along they are.",
    "- **Compare.** How a project differs from similar tools, and which one fits what you need.",
    "- **Explain a term.** MCP, sandbox, allow-list and similar words, in a line or two.",
    "- **Draw a flow.** Ask how a request moves through NiPlex-MCP and I will add a diagram.",
    "- **Show you around.** [Projects](/projects), [About](/about), [Sign up](/signup), the [newsletter](/newsletter), or [Submit](/submit) an idea or a request.",
    "",
    "I don't write code, do homework or answer general questions, and I can't see private repositories or personal details. Good ones to start with: `What is NiPlex-MCP?`, `How does NiPlex-Harness keep code execution safe?`, or `Which project fits an agent that needs tools?`"
  ].join("\n")
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
  }
  // A greeting in front of the question ("hey what you can do for me") does not change what is asked.
  const stripped = q.replace(/^(?:hi+|hey+|heya|hello+|hola|yo+|sup|ok|okay|so|bro|and|also)\b[ ,]*/, "").replace(/^(?:bro|man|dude)\b[ ,]*/, "");
  if (!hasProjectTerms && q.length <= 90 && (ABOUT_ME.test(q) || ABOUT_ME.test(stripped))) {
    return { kind: "smalltalk", reply: REPLIES.about };
  }
  if (!hasProjectTerms && OFFTOPIC.test(q)) return { kind: "offtopic", reply: OFFTOPIC_REPLY };
  return { kind: "question" };
}
