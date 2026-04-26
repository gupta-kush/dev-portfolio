// Static content for the portfolio. Preserved across redesigns so the new
// design only has to think about presentation, not copy/links.

export const PROFILE = {
  name: "Kush Gupta",
  initials: "KG",
  role: "Software Engineer",
  location: "Dallas, TX",
  email: "kushg0124@gmail.com",
  phone: "972-800-4922",
  github: "https://github.com/gupta-kush/",
  linkedin: "https://www.linkedin.com/in/kushgg/",
};

export type Project = {
  title: string;
  description: string;
  tech: string[];
  github?: string;
  url?: string;
};

export const PROJECTS: Project[] = [
  {
    title: "Spotify MCP Server",
    description:
      "A Model Context Protocol server that allows AI assistants to interact with the Spotify API. Search tracks, control playback, and manage playlists directly from your AI agent.",
    tech: ["TypeScript", "MCP", "Spotify API", "Node.js"],
    github: "https://github.com/gupta-kush/spotify-mcp",
  },
  {
    title: "Naked URLs",
    description:
      "A Chrome extension that automatically removes tracking parameters from URLs as you browse. Works in the background using Chrome's declarativeNetRequest API to protect your privacy.",
    tech: ["JavaScript", "Chrome Extension API", "Manifest V3"],
    github: "https://github.com/gupta-kush/naked-urls",
  },
];
