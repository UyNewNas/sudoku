type Props = {
  status: string;
  filled: number;
  conflicts: number;
};

export function StatusBar({ status, filled, conflicts }: Props) {
  return (
    <div className="w-full max-w-[560px] mt-4 flex items-center justify-between font-mono text-[11px] tracking-wider text-ink/60">
      <div className="flex items-center gap-2">
        <span
          className={
            "inline-block w-1.5 h-1.5 rounded-full " +
            (conflicts > 0 ? "bg-rust animate-pulse" : "bg-amber")
          }
        />
        <span className="uppercase">{status}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>已填 {filled}/81</span>
        <span className={conflicts > 0 ? "text-rust" : ""}>
          冲突 {conflicts}
        </span>
      </div>
    </div>
  );
}
