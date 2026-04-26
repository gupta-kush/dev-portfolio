// Static content for the portfolio. Source of truth for copy and links.

export const PROFILE = {
  name: "Kush Gupta",
  initials: "KG",
  role: "Software Engineer",
  location: "Dallas, TX",
  email: "kushg0124@gmail.com",
  phone: "972-800-4922",
  github: "https://github.com/gupta-kush/",
  linkedin: "https://www.linkedin.com/in/kushgg/",
  tagline: "SOFTWARE ENGINEER · PHOTOGRAPHER",
};

export type ArtifactKind = "tree" | "diff" | "terminal" | "commits";

export type Artifact =
  | { kind: "tree"; title: string; lines: ["dir" | "file", string, string?][] }
  | { kind: "diff"; title: string; lines: ["minus" | "plus" | "dim", string][] }
  | { kind: "terminal"; title: string; lines: ["in" | "out" | "dim", string][] }
  | { kind: "commits"; title: string; lines: ["c", string, string][] };

export type CaseBlock = { h: string; p: string };

export type Project = {
  n: string;
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  lang: string;
  status: "STABLE" | "PUBLISHED" | "IN PROGRESS" | "EXPERIMENTAL";
  stars: string;
  updated: string;
  github: string;
  url?: string;
  artifact: Artifact;
  blocks: CaseBlock[];
};

export const PROJECTS: Project[] = [
  {
    n: "01",
    id: "spotify-mcp",
    title: "Spotify MCP Server",
    subtitle: "an MCP server that lets an LLM drive Spotify.",
    tags: ["typescript", "mcp", "spotify-api", "node"],
    lang: "TypeScript",
    status: "STABLE",
    stars: "—",
    updated: "2025·12",
    github: "https://github.com/gupta-kush/spotify-mcp",
    artifact: {
      kind: "terminal",
      title: "~/spotify-mcp $ node dist/index.js",
      lines: [
        ["out", "spotify-mcp · listening on stdio"],
        ["out", "registered tools: search · queue · play · library · recent"],
        ["dim", ""],
        ["in", 'tool_call: search(query="quiet rainy afternoon")'],
        ["out", "  → 12 candidates · embedding cache hit 0.92"],
        ["in", "tool_call: queue(uris=[...3])"],
        ["out", "  → queued · ETA 9m12s"],
        ["in", "tool_call: play()"],
        ["out", '  ♪ now playing — Mount Eerie, "Through the Trees pt. 2"'],
        ["dim", ""],
        ["out", "rate-limit budget: 47/60 · cache hit ratio: 0.71"],
      ],
    },
    blocks: [
      { h: "CONTEXT", p: "I wanted to talk to an LLM about music and have it actually control my Spotify, not just describe what it would do." },
      { h: "APPROACH", p: "An MCP server that gives an LLM tools for searching, queueing, and playing music through Spotify. OAuth handles login, and a small cache keeps state between sessions so the model can build context over time." },
      { h: "NOTES", p: "The biggest design constraint was Spotify's rate limits. The model tends to make many similar search calls in a row, which gets blocked quickly. I added a semantic cache that recognizes near-duplicate queries and reuses earlier results." },
      { h: "STATUS", p: "Stable. I use it every day. Next I want to add a separate discovery tool and per-device routing." },
    ],
  },
  {
    n: "02",
    id: "naked-urls",
    title: "Naked URLs",
    subtitle: "a Chrome extension that strips tracking params from URLs.",
    tags: ["javascript", "chrome-ext", "privacy", "manifest-v3"],
    lang: "JavaScript",
    status: "PUBLISHED",
    stars: "—",
    updated: "2024·08",
    github: "https://github.com/gupta-kush/naked-urls",
    artifact: {
      kind: "diff",
      title: "URL, before / after",
      lines: [
        ["minus", "https://nytimes.com/2024/08/12/world/europe/article.html?"],
        ["minus", "  smid=tw-share&utm_source=newsletter&utm_medium=email"],
        ["minus", "  &utm_campaign=daily&utm_term=4242&_r=1&ref=share"],
        ["plus", "https://nytimes.com/2024/08/12/world/europe/article.html"],
        ["dim", ""],
        ["minus", "https://youtube.com/watch?v=dQw4w9WgXcQ&si=abc123&t=12&pp=ygUF"],
        ["plus", "https://youtube.com/watch?v=dQw4w9WgXcQ&t=12"],
        ["dim", ""],
        ["minus", "https://amazon.com/dp/B08N5WRWNW/ref=sr_1_1?keywords=...&qid=...&sr=8-1"],
        ["plus", "https://amazon.com/dp/B08N5WRWNW"],
      ],
    },
    blocks: [
      { h: "CONTEXT", p: "Most links online include tracking parameters that nobody actually wants. Cleaning them by hand got tedious." },
      { h: "APPROACH", p: "A Chrome extension that strips tracking parameters from URLs in the background, using a curated rule set. No telemetry, no popups, nothing to configure." },
      { h: "NOTES", p: "The whole extension is small. The rule set is the real value, and everything else is plumbing. I'm thinking about opening the rules to pull requests so other people can add their own." },
      { h: "STATUS", p: "Available on the Chrome Web Store. Runs quietly in the background." },
    ],
  },
];

// Brief shape used by the hero peek slabs.
export const PROJECTS_BRIEF = PROJECTS.map((p) => ({
  n: p.n,
  id: p.id,
  t: p.title,
  lang: p.lang,
  stat: p.status,
}));

export const CV_ROWS: { y: string; t: string; c: string; d: string }[] = [
  {
    y: "Feb 2025 — May 2025",
    t: "Mugdown Cafe",
    c: "Project Lead · College Station, TX",
    d: "Full-stack point-of-sale system for a local coffee shop processing 3,000+ orders/week. Node.js, PostgreSQL, AWS, Google OAuth, Meta Llama 3.2.",
  },
  {
    y: "Aug 2022 — May 2026",
    t: "B.S. Computer Science",
    c: "Texas A&M University · College Station, TX",
    d: "Recipient of the President's Endowed Scholarship, awarded to the top 25 individuals of an 80,000 student body.",
  },
  {
    y: "June 2025 — Present",
    t: "Software Developer · AI & Cloud",
    c: "Inogen · Dallas, TX",
    d: "Built an enterprise AI platform (4 specialized agents) saving 300+ hrs/month. Azure, Python, OpenAI, Redis, Docker, custom ServiceNow MCP.",
  },
];
