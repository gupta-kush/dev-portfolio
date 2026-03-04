export function Footer() {
  return (
    <footer className="bg-[var(--color-accent)] text-[var(--color-bg)] py-32 px-6 md:px-12 selection:bg-[var(--color-bg)] selection:text-[var(--color-accent)]">
      <div className="max-w-[100vw] overflow-hidden">
        <h2 className="font-display text-[18vw] leading-[0.8] uppercase text-center mb-20 tracking-tighter">
          Let's Talk
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto font-mono uppercase tracking-widest text-sm">
        <div className="flex flex-col gap-4">
          <p className="text-[var(--color-bg)]/60 mb-4">Socials</p>
          <a href="#" className="hover:underline underline-offset-4">
            GitHub
          </a>
          <a href="#" className="hover:underline underline-offset-4">
            LinkedIn
          </a>
          <a href="#" className="hover:underline underline-offset-4">
            Twitter
          </a>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-[var(--color-bg)]/60 mb-4">Contact</p>
          <a href="mailto:hello@kushgupta.dev" className="hover:underline underline-offset-4">
            hello@kushgupta.dev
          </a>
        </div>
        <div className="flex flex-col gap-4 md:text-right">
          <p className="text-[var(--color-bg)]/60 mb-4">Location</p>
          <p>San Francisco, CA</p>
          <p className="mt-auto pt-8 text-xs text-[var(--color-bg)]/60">
            © {new Date().getFullYear()} Kush Gupta
          </p>
        </div>
      </div>
    </footer>
  );
}
