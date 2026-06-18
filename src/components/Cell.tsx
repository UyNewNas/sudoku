import { ChangeEvent } from "react";

type Props = {
  index: number;
  value: number;
  isGiven: boolean;
  isSelected: boolean;
  isConflict: boolean;
  isPeer: boolean;
  isHighlightedNumber: boolean;
  onSelect: (i: number) => void;
  onChange: (i: number, v: number) => void;
};

export function Cell({
  index,
  value,
  isGiven,
  isSelected,
  isConflict,
  isPeer,
  isHighlightedNumber,
  onSelect,
  onChange,
}: Props) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  // 边框：行/列位置决定粗细
  const topHeavy = row % 3 === 0;
  const leftHeavy = col % 3 === 0;
  const rightHeavy = col === 8;
  const bottomHeavy = row === 8;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^1-9]/g, "").slice(-1);
    onChange(index, raw ? Number(raw) : 0);
  };

  let borderClass =
    "border-t border-l border-stone-300/70 " +
    (rightHeavy ? "border-r-2 border-r-ink/80 " : "border-r border-stone-300/70 ") +
    (bottomHeavy ? "border-b-2 border-b-ink/80 " : "border-b border-stone-300/70 ");
  if (topHeavy) borderClass += "border-t-2 border-t-ink/80 ";
  if (leftHeavy) borderClass += "border-l-2 border-l-ink/80 ";

  const stateClass = isSelected
    ? "bg-amber/20 ring-2 ring-amber ring-inset z-10"
    : isConflict
    ? "bg-rust/15 text-rust"
    : isHighlightedNumber
    ? "bg-amber/10"
    : isPeer
    ? "bg-ink/[0.04]"
    : "bg-transparent";

  return (
    <div
      className={
        "relative aspect-square flex items-center justify-center font-mono " +
        borderClass +
        " " +
        stateClass
      }
      onClick={() => onSelect(index)}
    >
      <input
        inputMode="numeric"
        maxLength={1}
        value={value === 0 ? "" : String(value)}
        readOnly={isGiven}
        onChange={handleChange}
        onFocus={() => onSelect(index)}
        className={
          "w-full h-full bg-transparent text-center outline-none caret-amber " +
          (isGiven
            ? "text-ink font-bold cursor-default"
            : "text-ink/80 font-medium focus:bg-amber/15")
        }
        aria-label={`cell-${index}`}
      />
    </div>
  );
}
