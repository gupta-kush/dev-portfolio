import { SnakeGame } from "./SnakeGame";

const PROJECTS = [
  {
    title: "YT to NLM Browser Extension",
    description:
      "A browser extension that seamlessly extracts transcripts from YouTube videos and sends them directly to Google's NotebookLM for instant summarization and chat.",
    tech: ["TypeScript", "React", "Chrome Extension API", "NotebookLM"],
    github: "#",
  },
  {
    title: "Mugdown Cafe",
    description:
      "A Fullstack POS Web App for a local cafe. Features order management, inventory tracking, and real-time updates for kitchen staff using WebSockets.",
    tech: ["Next.js", "Tailwind", "PostgreSQL", "Socket.io"],
    github: "#",
    link: "#",
  },
  {
    title: "Spotify MCP Server",
    description:
      "A Model Context Protocol server that allows AI assistants to interact with the Spotify API. Search tracks, control playback, and manage playlists directly from your AI agent.",
    tech: ["TypeScript", "MCP", "Spotify API", "Node.js"],
    github: "#",
  },
  {
    title: "Retro Snake",
    description:
      "A classic game built entirely in React. Use the arrow keys to play. A fun little interactive easter egg for visitors.",
    tech: ["React", "Hooks", "Game Loop"],
    component: <SnakeGame />,
  },
];

export function Projects() {
  return (
    <section id="code" className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <h2 className="font-display text-6xl md:text-8xl leading-[0.8] uppercase mb-6 text-[var(--color-text)]">
              Recent
              <br />
              Projects
            </h2>
            <p className="font-mono text-sm text-[var(--color-muted)] uppercase tracking-widest max-w-xs leading-relaxed">
              Building robust systems and crafting digital experiences.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-16 md:gap-24">
          {PROJECTS.map((project, i) => (
            <div key={i} className="group flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[var(--color-surface)] pb-6">
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {project.title}
                </h3>
                <div className="font-mono text-xs text-[var(--color-muted)]">
                  0{i + 1}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8">
                  <p className="text-[var(--color-muted)] text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="md:col-span-4 flex flex-col items-start md:items-end gap-6">
                  <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider border border-[var(--color-surface)] text-[var(--color-muted)] rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {project.github && (
                      <a
                        href={project.github}
                        className="text-xs font-mono uppercase tracking-widest hover:text-[var(--color-accent)] text-[var(--color-text)] transition-colors underline underline-offset-4"
                      >
                        Source
                      </a>
                    )}
                    {project.link && (
                      <a
                        href={project.link}
                        className="text-xs font-mono uppercase tracking-widest hover:text-[var(--color-accent)] text-[var(--color-text)] transition-colors underline underline-offset-4"
                      >
                        Live
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {project.component && (
                <div className="mt-4 w-full">{project.component}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
