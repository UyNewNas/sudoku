import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Board, DIFFICULTY, findConflicts, generatePuzzle, isValid, solve } from "../lib/sudoku";
import { SAMPLE_PUZZLES } from "../lib/puzzleBank";

export type Difficulty = keyof typeof DIFFICULTY;
export type Speed = "slow" | "medium" | "fast" | "instant";

const SPEED_MS: Record<Speed, number> = {
  slow: 90,
  medium: 35,
  fast: 8,
  instant: 0,
};

function emptyBoard(): Board {
  return new Array(81).fill(0);
}

function snapshot(board: Board, given: boolean[]) {
  return { board: board.slice(), given: given.slice() };
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function labelOf(d: Difficulty) {
  return { easy: "简单", medium: "中等", hard: "困难", expert: "专家" }[d];
}

export function useSudoku() {
  const [board, setBoard] = useState<Board>(() => emptyBoard());
  const [given, setGiven] = useState<boolean[]>(() => new Array(81).fill(false));
  const [selected, setSelected] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState(true);
  const [speed, setSpeed] = useState<Speed>("medium");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [solving, setSolving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("空白棋盘 · 点击格子开始填题");

  // 撤销 / 重做
  const past = useRef<{ board: Board; given: boolean[] }[]>([]);
  const future = useRef<{ board: Board; given: boolean[] }[]>([]);

  // 求解步骤缓存（仅动画模式使用）
  const stepsRef = useRef<Board[]>([]);
  const cancelRef = useRef(false);

  const conflicts = useMemo(() => findConflicts(board), [board]);
  const filled = useMemo(() => board.filter((v) => v !== 0).length, [board]);

  const pushHistory = useCallback((b: Board, g: boolean[]) => {
    past.current.push(snapshot(b, g));
    if (past.current.length > 80) past.current.shift();
    future.current = [];
  }, []);

  const loadBoard = useCallback((next: Board, asGiven: boolean, msg: string) => {
    past.current = [];
    future.current = [];
    setBoard(next.slice());
    setGiven(asGiven ? next.map((v) => v !== 0) : new Array(81).fill(false));
    setSelected(null);
    setStatusMsg(msg);
  }, []);

  const newGame = useCallback(
    (d: Difficulty = difficulty) => {
      const empties = DIFFICULTY[d];
      const puz = generatePuzzle(empties);
      loadBoard(puz, true, `新出题 · ${labelOf(d)}（${empties} 空格）`);
    },
    [difficulty, loadBoard]
  );

  const loadSample = useCallback(() => {
    const i = Math.floor(Math.random() * SAMPLE_PUZZLES.length);
    loadBoard(SAMPLE_PUZZLES[i], true, "已载入示例题 · 点击「解题」开始");
  }, [loadBoard]);

  const clearBoard = useCallback(() => {
    loadBoard(emptyBoard(), false, "棋盘已清空 · 可以重新出题");
  }, [loadBoard]);

  const setCell = useCallback(
    (i: number, value: number) => {
      if (given[i] || solving) return;
      if (value === board[i]) return;
      pushHistory(board, given);
      const next = board.slice();
      next[i] = value;
      setBoard(next);
      const conflict = showErrors && value !== 0 && !isValid(next, i, value);
      setStatusMsg(
        value === 0 ? "已擦除该格" : conflict ? "该数字与行/列/宫冲突" : "已更新"
      );
    },
    [board, given, pushHistory, showErrors, solving]
  );

  const eraseCell = useCallback((i: number) => setCell(i, 0), [setCell]);

  const solveAnimated = useCallback(async () => {
    if (solving) return;
    if (conflicts.size > 0) {
      setStatusMsg("当前题目有冲突，请先修正红框格子");
      return;
    }
    setSolving(true);
    cancelRef.current = false;
    stepsRef.current = [];
    setStatusMsg("求解中…");
    const start = board.slice();
    const delay = SPEED_MS[speed];

    let ok = false;
    if (delay === 0) {
      ok = solve(start);
      if (ok) setBoard(start);
    } else {
      ok = solve(start, (next) => {
        stepsRef.current.push(next);
      });
    }

    if (!ok) {
      setStatusMsg("此局无解，请检查题目");
      setSolving(false);
      return;
    }

    if (delay === 0) {
      setStatusMsg("解题完成 ✓");
      setSolving(false);
      return;
    }

    for (const s of stepsRef.current) {
      if (cancelRef.current) break;
      setBoard(s);
      await wait(delay);
    }
    setStatusMsg("解题完成 ✓");
    setSolving(false);
  }, [board, conflicts.size, solving, speed]);

  const stopSolve = useCallback(() => {
    cancelRef.current = true;
    setSolving(false);
    setStatusMsg("已暂停解题");
  }, []);

  const undo = useCallback(() => {
    const last = past.current.pop();
    if (!last) return;
    future.current.push(snapshot(board, given));
    setBoard(last.board);
    setGiven(last.given);
    setStatusMsg("已撤销");
  }, [board, given]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(snapshot(board, given));
    setBoard(next.board);
    setGiven(next.given);
    setStatusMsg("已重做");
  }, [board, given]);

  // 键盘输入
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected === null) return;
      const k = e.key;
      if (k >= "1" && k <= "9") {
        setCell(selected, Number(k));
        e.preventDefault();
      } else if (k === "Backspace" || k === "Delete" || k === "0") {
        eraseCell(selected);
        e.preventDefault();
      } else if (k === "ArrowUp") {
        setSelected((s) => (s === null ? 0 : Math.max(0, s - 9)));
        e.preventDefault();
      } else if (k === "ArrowDown") {
        setSelected((s) => (s === null ? 0 : Math.min(80, s + 9)));
        e.preventDefault();
      } else if (k === "ArrowLeft") {
        setSelected((s) => (s === null ? 0 : Math.max(0, s - 1)));
        e.preventDefault();
      } else if (k === "ArrowRight") {
        setSelected((s) => (s === null ? 0 : Math.min(80, s + 1)));
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, setCell, eraseCell]);

  // 首次进入自动载入示例
  useEffect(() => {
    loadSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    board,
    given,
    selected,
    setSelected,
    setCell,
    eraseCell,
    showErrors,
    setShowErrors,
    speed,
    setSpeed,
    difficulty,
    setDifficulty,
    conflicts,
    filled,
    statusMsg,
    newGame,
    loadSample,
    clearBoard,
    undo,
    redo,
    solving,
    solveAnimated,
    stopSolve,
  };
}
