import { Cell } from "./Cell";
import type { Board } from "../lib/sudoku";

type Props = {
  board: Board;
  given: boolean[];
  selected: number | null;
  conflicts: Set<number>;
  onSelect: (i: number) => void;
  onChange: (i: number, v: number) => void;
};

const PEERS_FOR = (i: number): Set<number> => {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const s = new Set<number>();
  for (let k = 0; k < 9; k++) {
    s.add(r * 9 + k);
    s.add(k * 9 + c);
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      s.add((br + dr) * 9 + (bc + dc));
    }
  }
  s.delete(i);
  return s;
};

export function BoardView({
  board,
  given,
  selected,
  conflicts,
  onSelect,
  onChange,
}: Props) {
  const selectedValue = selected !== null ? board[selected] : 0;
  const peerSet = selected !== null ? PEERS_FOR(selected) : new Set<number>();

  return (
    <div className="relative">
      {/* 角部十字装饰 */}
      <CornerOrnament className="absolute -top-3 -left-3" />
      <CornerOrnament className="absolute -top-3 -right-3 rotate-90" />
      <CornerOrnament className="absolute -bottom-3 -left-3 -rotate-90" />
      <CornerOrnament className="absolute -bottom-3 -right-3 rotate-180" />

      <div
        className="grid grid-cols-9 w-full max-w-[560px] aspect-square border-2 border-ink/80 bg-paper rounded-sm shadow-[0_18px_36px_-18px_rgba(15,61,46,0.45)]"
        role="grid"
        aria-label="数独棋盘"
      >
        {board.map((v, i) => {
          const isHighlightedNumber =
            selected !== null && selectedValue !== 0 && v === selectedValue;
          return (
            <Cell
              key={i}
              index={i}
              value={v}
              isGiven={given[i]}
              isSelected={selected === i}
              isConflict={conflicts.has(i)}
              isPeer={selected !== null && peerSet.has(i) && selected !== i}
              isHighlightedNumber={isHighlightedNumber}
              onSelect={onSelect}
              onChange={onChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function CornerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className={"text-ink/70 " + className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M2 2 L20 2" />
      <path d="M2 2 L2 20" />
      <path d="M5 5 L9 5" />
      <path d="M5 5 L5 9" />
    </svg>
  );
}
