// 数独核心算法：校验、回溯求解、挖空生成、冲突检测
// 棋盘用长度为 81 的一维数组表示：board[i] ∈ [0,9]，0 代表空格

export type Board = number[];
export type ConflictSet = Set<number>;

export const SIZE = 81;
export const ROW = 9;
export const COL = 9;

export const idx = (r: number, c: number) => r * 9 + c;
export const rowOf = (i: number) => Math.floor(i / 9);
export const colOf = (i: number) => i % 9;
export const boxOf = (i: number) => {
  const r = Math.floor(i / 9);
  const c = i % 9;
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
};

// 给定 idx 拿到它的「同行/同列/同宫」其它格子（去重）
function peers(i: number): number[] {
  const r = rowOf(i);
  const c = colOf(i);
  const b = boxOf(i);
  const seen = new Set<number>();
  for (let k = 0; k < 9; k++) {
    seen.add(idx(r, k));
    seen.add(idx(k, c));
  }
  const br = Math.floor(b / 3) * 3;
  const bc = (b % 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      seen.add(idx(br + dr, bc + dc));
    }
  }
  seen.delete(i);
  return Array.from(seen);
}

const PEER_TABLE: number[][] = Array.from({ length: 81 }, (_, i) => peers(i));

// 判断 board[idx] = num 是否与行/列/宫冲突；num=0 视为空，永远合法
export function isValid(board: Board, i: number, num: number): boolean {
  if (num === 0) return true;
  const peers = PEER_TABLE[i];
  for (const p of peers) {
    if (board[p] === num) return false;
  }
  return true;
}

// 返回当前棋盘所有冲突的格子下标
export function findConflicts(board: Board): ConflictSet {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) continue;
    const peers = PEER_TABLE[i];
    for (const p of peers) {
      if (board[p] === board[i]) {
        conflicts.add(i);
        conflicts.add(p);
      }
    }
  }
  return conflicts;
}

// 复制棋盘
function clone(b: Board): Board {
  return b.slice();
}

// 回溯求解；返回 true 时 board 原地变为首个解
// onStep 在每次「确定一格」时回调（用于播放动画）
export function solve(
  start: Board,
  onStep?: (next: Board) => void
): boolean {
  const board = clone(start);
  // 收集空白格
  const empties: number[] = [];
  for (let i = 0; i < 81; i++) if (board[i] === 0) empties.push(i);

  // 先校验当前已填数字无冲突
  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) {
      const v = board[i];
      board[i] = 0;
      const ok = isValid(board, i, v);
      board[i] = v;
      if (!ok) return false;
    }
  }

  // 按候选数升序尝试，提升剪枝
  function backtrack(pos: number): boolean {
    if (pos === empties.length) return true;
    const cell = empties[pos];
    for (let n = 1; n <= 9; n++) {
      if (isValid(board, cell, n)) {
        board[cell] = n;
        onStep?.(clone(board));
        if (backtrack(pos + 1)) return true;
        board[cell] = 0;
        onStep?.(clone(board));
      }
    }
    return false;
  }

  return backtrack(0);
}

// 内部工具：深搜统计解的数量
function countSolutions(start: Board, cap = 2): number {
  const board = clone(start);
  let count = 0;
  function bt(): void {
    if (count >= cap) return;
    let cell = -1;
    let bestCand = 0;
    let bestMask = 0;
    for (let i = 0; i < 81; i++) {
      if (board[i] !== 0) continue;
      const m = candidatesMask(board, i);
      const pop = popcount(m);
      if (cell === -1 || pop < bestCand) {
        cell = i;
        bestCand = pop;
        bestMask = m;
        if (pop <= 1) break;
      }
    }
    if (cell === -1) {
      count++;
      return;
    }
    let m = bestMask;
    while (m && count < cap) {
      const n = lowestBit(m);
      m &= m - 1;
      board[cell] = n;
      bt();
      board[cell] = 0;
    }
  }
  bt();
  return count;
}

function candidatesMask(board: Board, i: number): number {
  let mask = 0;
  const peers = PEER_TABLE[i];
  for (const p of peers) {
    const v = board[p];
    if (v >= 1 && v <= 9) mask |= 1 << v;
  }
  return (~mask) & 0x3fe; // bits 1..9
}

function popcount(x: number): number {
  let c = 0;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
}

function lowestBit(x: number): number {
  let n = 0;
  let v = x;
  while ((v & 1) === 0) {
    v >>= 1;
    n++;
  }
  return n;
}

// 生成指定难度的题目；难度 = 挖空数量
export function generatePuzzle(emptyCount = 45): Board {
  // 先生成一个完整解
  const solved: Board = new Array(81).fill(0);
  fillRandom(solved);

  // 随机挖空
  const order = shuffle(Array.from({ length: 81 }, (_, i) => i));
  let removed = 0;
  for (const cell of order) {
    if (removed >= emptyCount) break;
    const backup = solved[cell];
    solved[cell] = 0;
    // 唯一性校验（限制搜索次数以提速）
    const n = countSolutions(solved, 2);
    if (n !== 1) {
      solved[cell] = backup; // 还原
    } else {
      removed++;
    }
  }
  return solved;
}

function fillRandom(board: Board): boolean {
  let cell = -1;
  let bestMask = 0;
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      const m = candidatesMask(board, i);
      if (cell === -1 || popcount(m) < popcount(bestMask)) {
        cell = i;
        bestMask = m;
      }
    }
  }
  if (cell === -1) return true;
  let m = bestMask;
  const nums: number[] = [];
  while (m) {
    const n = lowestBit(m);
    m &= m - 1;
    nums.push(n);
  }
  shuffleInPlace(nums);
  for (const n of nums) {
    board[cell] = n;
    if (fillRandom(board)) return true;
    board[cell] = 0;
  }
  return false;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  shuffleInPlace(a);
  return a;
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 难度预设
export const DIFFICULTY = {
  easy: 36,
  medium: 45,
  hard: 52,
  expert: 58,
} as const;
