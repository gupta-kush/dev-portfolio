import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { PieceFrame, PieceAction } from "../PieceFrame";
import { ReactionDiffusionCanvas } from "./canvas/ReactionDiffusionCanvas";

export function ReactionDiffusion() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <PieceFrame
      number="01"
      title="Reaction Diffusion"
      caption="I wanted to see how Gray-Scott behaves when you seed it asymmetrically. The chemicals A and B fight; what looks like growth is just one losing slowly."
      hint="click anywhere on the surface to seed new growth"
      actions={
        <PieceAction onClick={() => setResetKey((k) => k + 1)} label="Reset">
          <RotateCcw size={12} strokeWidth={1.5} />
          <span>Reset</span>
        </PieceAction>
      }
    >
      <div
        key={resetKey}
        className="w-full aspect-[16/9] md:aspect-[21/9] bg-black overflow-hidden"
        style={{ touchAction: "manipulation" }}
      >
        <ReactionDiffusionCanvas
          gridW={260}
          gridH={140}
          steps={6}
          interactive
          ariaLabel="Reaction-diffusion simulation. Click to seed new growth."
        />
      </div>
    </PieceFrame>
  );
}
