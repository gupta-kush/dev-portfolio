import { useState, useEffect } from "react";

const GRID_WIDTH = 30;
const GRID_HEIGHT = 15;

export function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 15, y: 7 }]);
  const [food, setFood] = useState({ x: 10, y: 7 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setSnake([{ x: 15, y: 7 }]);
    setDir({ x: 1, y: 0 });
    setGameOver(false);
    setIsPlaying(true);
    setScore(0);
    setFood({ x: 5, y: 5 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowUp":
          setDir((prev) => (prev.y === 1 ? prev : { x: 0, y: -1 }));
          break;
        case "ArrowDown":
          setDir((prev) => (prev.y === -1 ? prev : { x: 0, y: 1 }));
          break;
        case "ArrowLeft":
          setDir((prev) => (prev.x === 1 ? prev : { x: -1, y: 0 }));
          break;
        case "ArrowRight":
          setDir((prev) => (prev.x === -1 ? prev : { x: 1, y: 0 }));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const moveSnake = () => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_WIDTH ||
          newHead.y < 0 ||
          newHead.y >= GRID_HEIGHT ||
          prev.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y,
          )
        ) {
          setGameOver(true);
          setIsPlaying(false);
          return prev;
        }

        const newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          setFood({
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT),
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };
    const interval = setInterval(moveSnake, 120);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, dir, food]);

  return (
    <div className="flex flex-col w-full bg-[#0c0c0c] text-[#00ff00] font-mono p-4 rounded-md border border-[#333] shadow-2xl">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-[#333] pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 opacity-80"></div>
        <span className="ml-2 text-xs text-[#666] uppercase tracking-widest">
          bash - 80x24
        </span>
      </div>

      <div className="flex justify-between w-full mb-4 text-xs tracking-widest opacity-90">
        <span>guest@kush-gupta:~/projects/snake$ ./play --score={score}</span>
        {gameOver && (
          <span className="text-red-500 animate-pulse">
            SIGSEGV (core dumped)
          </span>
        )}
      </div>

      <div className="relative bg-black overflow-hidden w-full aspect-[2/1] border border-[#222] rounded-sm">
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <button
              onClick={startGame}
              className="text-sm font-mono uppercase tracking-widest hover:text-white text-[#00ff00] transition-colors"
            >
              $ ./start.sh<span className="animate-pulse">_</span>
            </button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-10">
            <p className="text-red-500 font-mono text-2xl uppercase mb-6">
              FATAL ERROR
            </p>
            <button
              onClick={startGame}
              className="text-sm font-mono uppercase tracking-widest hover:text-white text-[#00ff00] transition-colors"
            >
              $ ./retry.sh<span className="animate-pulse">_</span>
            </button>
          </div>
        )}

        {/* Grid */}
        {Array.from({ length: GRID_HEIGHT }).map((_, y) =>
          Array.from({ length: GRID_WIDTH }).map((_, x) => {
            const isSnake = snake.some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;
            const isHead = snake[0].x === x && snake[0].y === y;

            return (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={{
                  width: `${100 / GRID_WIDTH}%`,
                  height: `${100 / GRID_HEIGHT}%`,
                  left: `${x * (100 / GRID_WIDTH)}%`,
                  top: `${y * (100 / GRID_HEIGHT)}%`,
                  backgroundColor: isHead
                    ? "#00ff00"
                    : isSnake
                      ? "#00cc00"
                      : isFood
                        ? "#ff0000"
                        : "transparent",
                  opacity: isFood ? 0.9 : isSnake && !isHead ? 0.7 : 1,
                  boxShadow: isFood
                    ? "0 0 8px #ff0000"
                    : isHead
                      ? "0 0 8px #00ff00"
                      : "none",
                }}
              />
            );
          }),
        )}
      </div>
      <p className="mt-4 font-mono text-[10px] text-[#666] uppercase tracking-widest">
        &gt; USE ARROW KEYS TO NAVIGATE
      </p>
    </div>
  );
}
