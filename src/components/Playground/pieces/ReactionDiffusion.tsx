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
      caption="Two simulated chemicals on a grid. One eats the other. Click anywhere to drop more of the loud one and watch it spread."
      hint="click to seed"
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
          gridW={400}
          gridH={220}
          steps={5}
          interactive
          ariaLabel="Reaction-diffusion simulation. Click to seed new growth."
        />
      </div>
    </PieceFrame>
  );
}
