import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useAnimationFrame, useMotionValue } from "motion/react";
import { X } from "lucide-react";

interface Photo {
  id: number;
  url: string;
  title: string;
  description: string;
  camera: string;
  settings: string;
}

const PHOTOS: Photo[] = [
  {
    id: 1,
    url: "https://picsum.photos/seed/kushstreet/1200/900",
    title: "Urban Geometry",
    description:
      "A study of leading lines and brutalist architecture in the heart of the financial district. The harsh midday sun created these dramatic, unyielding shadows.",
    camera: "Leica Q2",
    settings: "28mm • f/8 • 1/500s • ISO 100",
  },
  {
    id: 2,
    url: "https://picsum.photos/seed/kushsunset/1200/900",
    title: "Golden Hour",
    description:
      "Catching the last rays of light as they bounce off the glass facades. The warmth of the sun contrasts perfectly with the cool tones of the city.",
    camera: "Sony A7IV",
    settings: "50mm • f/2.8 • 1/200s • ISO 400",
  },
  {
    id: 3,
    url: "https://picsum.photos/seed/kushland/1200/900",
    title: "Mountain Pass",
    description:
      "An early morning hike rewarded with this pristine view of the valley. The fog was just starting to lift, revealing the jagged peaks.",
    camera: "Fujifilm X-T4",
    settings: "16mm • f/11 • 1/60s • ISO 160",
  },
  {
    id: 4,
    url: "https://picsum.photos/seed/kushbird/1200/900",
    title: "Avian Flight",
    description:
      "Patience pays off. Waited three hours in the blind to capture this majestic creature taking flight across the marshlands.",
    camera: "Canon R5",
    settings: "400mm • f/5.6 • 1/2000s • ISO 800",
  },
  {
    id: 5,
    url: "https://picsum.photos/seed/kushstreet2/1200/900",
    title: "City Lights",
    description:
      "The city comes alive at night. Long exposure capturing the light trails of passing cars against the neon backdrop of downtown.",
    camera: "Nikon Z7 II",
    settings: "35mm • f/16 • 15s • ISO 64",
  },
];

// Duplicate for seamless marquee
const MARQUEE_PHOTOS = [...PHOTOS, ...PHOTOS];

function MarqueeContainer({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentSpeed = useRef(1.5);
  
  useAnimationFrame((t, delta) => {
    const targetSpeed = isHovered ? 0.5 : 1.5;
    // Smoothly interpolate current speed towards target speed
    currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.05;
    
    let newX = x.get() - (currentSpeed.current * (delta / 16));
    
    if (contentRef.current) {
      const halfWidth = contentRef.current.scrollWidth / 2;
      // Seamlessly reset when past halfway
      if (Math.abs(newX) >= halfWidth) {
        newX += halfWidth;
      }
    }
    x.set(newX);
  });

  return (
    <motion.div 
      className="flex w-max gap-6 px-3"
      style={{ x }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={contentRef}
    >
      {children}
    </motion.div>
  );
}

function PhotoCard({
  photo,
  onClick,
}: {
  photo: Photo;
  onClick: () => void;
  key?: string | number;
}) {
  return (
    <div
      role="button"
      className="relative w-[300px] md:w-[450px] aspect-[4/3] shrink-0 overflow-hidden group rounded-sm cursor-none"
      onClick={onClick}
    >
      <img
        src={photo.url}
        alt={photo.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-[filter,opacity,transform] duration-500 group-hover:scale-105 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-none">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text)]">
          {photo.title}
        </p>
      </div>
    </div>
  );
}

export function Photography() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <section
      id="lens"
      className="py-32 overflow-hidden bg-[var(--color-surface)]"
    >
      <div className="px-6 md:px-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="font-display text-6xl md:text-8xl leading-[0.8] uppercase text-[var(--color-text)] mb-4">
            Out of
            <br />
            Office
          </h2>
          <p className="font-mono text-sm text-[var(--color-muted)] uppercase tracking-widest">
            Life through a lens
          </p>
        </div>
        <p className="max-w-md text-[var(--color-muted)] text-lg leading-relaxed">
          When I'm not writing code, I'm usually exploring the world with my
          camera. It's a hobby that helps me find new perspectives.
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        <MarqueeContainer>
          {MARQUEE_PHOTOS.map((photo, i) => (
            <PhotoCard
              key={`${photo.id}-${i}`}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
            />
          ))}
        </MarqueeContainer>
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg)]/95 backdrop-blur-md p-6 md:p-12"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-6 right-6 md:top-12 md:right-12 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors z-50"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={32} strokeWidth={1} />
            </button>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-7xl max-h-full flex flex-col lg:flex-row gap-8 lg:gap-16 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full lg:w-2/3 shrink-0 flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </div>
              <div className="w-full lg:w-1/3 flex flex-col justify-center py-8">
                <h3 className="font-display text-5xl md:text-7xl uppercase text-[var(--color-text)] mb-6 leading-[0.85]">
                  {selectedPhoto.title}
                </h3>
                <p className="text-[var(--color-muted)] text-lg leading-relaxed mb-12">
                  {selectedPhoto.description}
                </p>
                <div className="flex flex-col gap-4 font-mono text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  <div className="flex flex-col gap-1 border-t border-[var(--color-surface)] pt-4">
                    <span className="text-[var(--color-text)]">Gear</span>
                    <span>{selectedPhoto.camera}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-[var(--color-surface)] pt-4">
                    <span className="text-[var(--color-text)]">Settings</span>
                    <span>{selectedPhoto.settings}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
