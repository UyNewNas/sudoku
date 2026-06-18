import { BoardView } from "../components/Board";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";
import { useSudoku } from "../hooks/useSudoku";

export function SolverPage() {
  const s = useSudoku();

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-10 sm:py-16">
      {/* 顶部标题 */}
      <header className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] text-ink/50 uppercase">
          <span className="w-6 h-px bg-ink/30" />
          <span>Sudoku · 数独解题器</span>
          <span className="w-6 h-px bg-ink/30" />
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-semibold text-ink mt-3 tracking-tight">
          一格一念 <span className="text-amber">/</span> 数归一
        </h1>
        <p className="font-mono text-xs sm:text-sm text-ink/60 mt-2">
          填入题目 → 点击「解题」 → 见证回溯在 9×9 宫内自洽
        </p>
      </header>

      <BoardView
        board={s.board}
        given={s.given}
        selected={s.selected}
        conflicts={s.conflicts}
        onSelect={s.setSelected}
        onChange={s.setCell}
      />

      <Toolbar
        solving={s.solving}
        speed={s.speed}
        setSpeed={s.setSpeed}
        difficulty={s.difficulty}
        setDifficulty={s.setDifficulty}
        showErrors={s.showErrors}
        setShowErrors={s.setShowErrors}
        onNewGame={() => s.newGame()}
        onLoadSample={s.loadSample}
        onClear={s.clearBoard}
        onUndo={s.undo}
        onRedo={s.redo}
        onSolve={s.solveAnimated}
        onStop={s.stopSolve}
      />

      <StatusBar
        status={s.statusMsg}
        filled={s.filled}
        conflicts={s.conflicts.size}
      />

      <footer className="mt-12 text-[10px] font-mono tracking-widest text-ink/40 uppercase">
        Crafted with <span className="text-amber">回溯</span> &amp;{" "}
        <span className="text-amber">剪枝</span>
      </footer>
    </main>
  );
}
