import {
  Eraser,
  Play,
  Pause,
  Undo2,
  Redo2,
  Sparkles,
  FileText,
  Settings2,
  Zap,
} from "lucide-react";
import { Difficulty, Speed } from "../hooks/useSudoku";

type Props = {
  solving: boolean;
  speed: Speed;
  setSpeed: (s: Speed) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  showErrors: boolean;
  setShowErrors: (v: boolean) => void;
  onNewGame: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSolve: () => void;
  onStop: () => void;
};

export function Toolbar(p: Props) {
  return (
    <div className="w-full max-w-[560px] mt-6 flex flex-col gap-3">
      {/* 主操作行 */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <button
          onClick={p.onSolve}
          disabled={p.solving}
          className="group flex items-center gap-2 px-4 py-2 rounded-md bg-ink text-paper font-mono text-sm tracking-wider hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {p.solving ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{p.solving ? "解题中…" : "解题"}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <IconButton onClick={p.onNewGame} title="新出题">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">新局</span>
          </IconButton>
          <IconButton onClick={p.onLoadSample} title="载入示例">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">示例</span>
          </IconButton>
          <IconButton onClick={p.onClear} title="清空">
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">清空</span>
          </IconButton>
          <IconButton onClick={p.onUndo} title="撤销">
            <Undo2 className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={p.onRedo} title="重做">
            <Redo2 className="w-4 h-4" />
          </IconButton>
          {p.solving && (
            <IconButton onClick={p.onStop} title="暂停解题">
              <Pause className="w-4 h-4" />
              <span>暂停</span>
            </IconButton>
          )}
        </div>
      </div>

      {/* 设置行 */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink/70">
        <div className="flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5" />
          <span>难度</span>
          <PillGroup
            value={p.difficulty}
            onChange={(v) => p.setDifficulty(v as Difficulty)}
            options={[
              { v: "easy", l: "简单" },
              { v: "medium", l: "中等" },
              { v: "hard", l: "困难" },
              { v: "expert", l: "专家" },
            ]}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>速度</span>
          <PillGroup
            value={p.speed}
            onChange={(v) => p.setSpeed(v as Speed)}
            options={[
              { v: "slow", l: "慢" },
              { v: "medium", l: "中" },
              { v: "fast", l: "快" },
              { v: "instant", l: "瞬" },
            ]}
          />
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={p.showErrors}
            onChange={(e) => p.setShowErrors(e.target.checked)}
            className="accent-amber w-3.5 h-3.5"
          />
          <span>标错</span>
        </label>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-ink/20 text-ink/80 font-mono text-xs hover:border-amber hover:text-ink hover:bg-amber/10 transition"
    >
      {children}
    </button>
  );
}

function PillGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="inline-flex border border-ink/20 rounded-md overflow-hidden">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={
            "px-2 py-0.5 font-mono text-[11px] transition " +
            (value === o.v
              ? "bg-ink text-paper"
              : "text-ink/70 hover:bg-amber/15")
          }
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
