import { motion } from "motion/react";

const PROJECTS = [
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

export function Projects() {
  return (
    <section id="code" className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-32"
          >
            <h2 className="font-display text-6xl md:text-8xl leading-[0.8] uppercase mb-6 text-[var(--color-text)]">
              Recent
              <br />
              Projects
            </h2>
            <p className="font-mono text-sm text-[var(--color-muted)] uppercase tracking-widest max-w-xs leading-relaxed">
              Building robust systems and crafting digital experiences.
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-16 md:gap-24 group/list">
          {PROJECTS.map((project, i) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              key={i}
              className="group flex flex-col gap-6 transition-all duration-500 hover:!opacity-100 group-hover/list:opacity-30"
            >
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[var(--color-surface)] pb-6">
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors duration-300">
                  {project.title}
                </h3>
                <div className="font-mono text-xs text-[var(--color-muted)] transform group-hover:-translate-y-1 transition-transform duration-300">
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
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono uppercase tracking-widest hover:text-[var(--color-accent)] text-[var(--color-text)] transition-colors underline underline-offset-4"
                      >
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
