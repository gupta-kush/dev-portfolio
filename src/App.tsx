import { useState } from "react";
import { LoaderGate } from "./components/Loader";
import { TopNav } from "./components/TopNav";
import { Hero } from "./components/Hero";
import { Seam } from "./components/Seam";
import { Work } from "./components/Work";
import { Frames } from "./components/Frames";
import { Lightbox } from "./components/Lightbox";
import { CV } from "./components/CV";
import { Contact } from "./components/Contact";
import { CasePage } from "./components/Case";
import { useRoute } from "./hooks/useRoute";
import type { GalleryPhoto } from "./photos";

// Section background colours used by the seam gradients between sections.
const INK = "#0a0908";
const PAPER = "var(--paper)";

function Home({ onLightboxOpen }: { onLightboxOpen: (idx: number, list: GalleryPhoto[]) => void }) {
  return (
    <>
      <Hero />
      <Seam kind="leak" from={INK} to={PAPER} />
      <Work />
      <Seam kind="grain" from={PAPER} to={INK} />
      <Frames onOpen={onLightboxOpen} />
      <Seam kind="chroma" from={INK} to={PAPER} />
      <CV />
      <Seam kind="displace" from={PAPER} to={INK} />
      <Contact />
    </>
  );
}

export default function App() {
  const route = useRoute();
  const [lb, setLb] = useState<{ idx: number | null; photos: GalleryPhoto[] }>({
    idx: null,
    photos: [],
  });

  return (
    <>
      <LoaderGate />
      <TopNav route={route} />

      {route.name === "home" ? (
        <Home onLightboxOpen={(idx, list) => setLb({ idx, photos: list })} />
      ) : (
        <CasePage id={route.id} />
      )}

      <Lightbox
        photos={lb.photos}
        idx={lb.idx}
        onClose={() => setLb({ idx: null, photos: [] })}
        onNav={(d) =>
          setLb((s) => ({
            ...s,
            idx: s.idx === null ? null : (s.idx + d + s.photos.length) % s.photos.length,
          }))
        }
      />
    </>
  );
}
