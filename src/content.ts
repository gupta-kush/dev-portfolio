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
      { h: "CONTEXT", p: 'I wanted to ask an LLM things like "play something quiet for a rainy afternoon" — and have it actually run end to end against my real Spotify account.' },
      { h: "APPROACH", p: "A Model Context Protocol server exposing Spotify's search, playback and library APIs as discrete tools. OAuth handles auth, a small cache holds state between sessions so the model has memory." },
      { h: "NOTES", p: "Rate limits drove the architecture. The model wants to call search() ten times to triangulate a vibe; Spotify allows about two. A semantic cache in front of every read tool dedupes near-identical queries by embedding distance." },
      { h: "STATUS", p: "Stable, used daily. Roadmap: expose discovery as a separate tool, add per-device routing." },
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
      { h: "CONTEXT", p: "Every link came dressed in utm_source and a dozen other parameters no human asked for. Cleaning them by hand stopped scaling." },
      { h: "APPROACH", p: "A Manifest V3 extension that uses Chrome's declarativeNetRequest API to rewrite URLs in the background through a curated rule set. No telemetry, no popups." },
      { h: "NOTES", p: "Whole extension is small. The rule set is the actual product; everything else is plumbing. Open question: ship the rules as community-edited so contributions go through pull requests instead of my inbox." },
      { h: "STATUS", p: "Published on the Chrome Web Store. Works silently in the background." },
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
