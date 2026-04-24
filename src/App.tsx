import { useEffect } from "react";
import Lenis from "lenis";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Playground } from "./components/Playground/Playground";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ThemeToggle } from "./components/ThemeToggle";
import { CustomCursor } from "./components/CustomCursor";

export default function App() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <CustomCursor />
      <Navbar />
      <ThemeToggle />
      <main className="flex-grow">
        <Hero />
        <Projects />
        <Playground />
      </main>
      <Footer />
    </div>
  );
}
