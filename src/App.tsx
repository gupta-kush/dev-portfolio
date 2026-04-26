import { useState } from "react";
import { LoaderGate } from "./components/Loader";
import { TopNav } from "./components/TopNav";
import { Hero } from "./components/Hero";
import { Distortion } from "./components/Distortion";
import { Work } from "./components/Work";
import { Frames } from "./components/Frames";
import { Lightbox } from "./components/Lightbox";
import { CV } from "./components/CV";
import { Contact } from "./components/Contact";
import { CasePage } from "./components/Case";
import { useRoute } from "./hooks/useRoute";
import type { GalleryPhoto } from "./photos";

function Home({ onLightboxOpen }: { onLightboxOpen: (idx: number, list: GalleryPhoto[]) => void }) {
  return (
    <>
      <Hero />
      <Distortion kind="displace" desc="Displacement — code becomes light." />
      <Work />
      <Distortion kind="leak" desc="Light leaks across the gate." />
      <Frames onOpen={onLightboxOpen} />
      <Distortion kind="grain" desc="Grain bloom." />
      <CV />
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
