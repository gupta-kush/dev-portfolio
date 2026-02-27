export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-50 mix-blend-difference pointer-events-none text-[#F2EBE3]">
      <a
        href="#top"
        className="font-display text-3xl uppercase tracking-widest pointer-events-auto hover:text-[#E85D38] transition-colors"
      >
        KG
      </a>
      <div className="flex gap-6 md:gap-12 font-mono text-xs md:text-sm uppercase tracking-widest pointer-events-auto">
        <a href="#code" className="hover:text-[#E85D38] transition-colors">
          Code
        </a>
        <a href="#lens" className="hover:text-[#E85D38] transition-colors">
          Lens
        </a>
      </div>
    </nav>
  );
}
