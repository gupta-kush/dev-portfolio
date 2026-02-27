import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Photography } from "./components/Photography";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Navbar />
      <ThemeToggle />
      <main className="flex-grow">
        <Hero />
        <Projects />
        <Photography />
      </main>
      <Footer />
    </div>
  );
}
