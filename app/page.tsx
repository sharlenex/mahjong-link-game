"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ROWS = 7;
const COLS = 14;
const TILES = ["🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏","🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡","🀢"];
const LEVELS = [
  { name: "初入雀门", icons: 12, time: 240 },
  { name: "竹影听风", icons: 18, time: 210 },
  { name: "三元会馆", icons: 23, time: 180 },
  { name: "九莲宝灯", icons: 27, time: 150 },
  { name: "雀圣之巅", icons: 27, time: 120 },
];

type Cell = number | null;
type Pos = [number, number];

function shuffle<T>(values: T[]) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newBoard(iconCount: number): Cell[] {
  const pairs: number[] = [];
  for (let i = 0; i < (ROWS * COLS) / 2; i++) {
    const tile = i % iconCount;
    pairs.push(tile, tile);
  }
  return shuffle(pairs);
}

function idx(r: number, c: number) { return r * COLS + c; }

function findPath(board: Cell[], a: Pos, b: Pos): Pos[] | null {
  if (a[0] === b[0] && a[1] === b[1]) return null;
  if (board[idx(...a)] == null || board[idx(...a)] !== board[idx(...b)]) return null;
  const h = ROWS + 2, w = COLS + 2;
  const open = (r: number, c: number) => {
    if (r === 0 || c === 0 || r === h - 1 || c === w - 1) return true;
    const rr = r - 1, cc = c - 1;
    return board[idx(rr, cc)] == null || (rr === b[0] && cc === b[1]);
  };
  const start: Pos = [a[0] + 1, a[1] + 1];
  const target: Pos = [b[0] + 1, b[1] + 1];
  const dirs: Pos[] = [[1,0],[-1,0],[0,1],[0,-1]];
  type Node = { r:number; c:number; d:number; turns:number; path:Pos[] };
  const q: Node[] = dirs.map((_, d) => ({ r:start[0], c:start[1], d, turns:0, path:[start] }));
  const seen = new Map<string, number>();
  while (q.length) {
    const cur = q.shift()!;
    for (let nd = 0; nd < 4; nd++) {
      const turns = cur.turns + (nd === cur.d ? 0 : 1);
      if (turns > 2) continue;
      const nr = cur.r + dirs[nd][0], nc = cur.c + dirs[nd][1];
      if (nr < 0 || nc < 0 || nr >= h || nc >= w || !open(nr,nc)) continue;
      const key = `${nr},${nc},${nd}`;
      if ((seen.get(key) ?? 9) <= turns) continue;
      seen.set(key, turns);
      const path = nd === cur.d ? cur.path : [...cur.path, [cur.r,cur.c] as Pos];
      if (nr === target[0] && nc === target[1]) return [...path, target].map(([r,c]) => [r-1,c-1]);
      q.push({ r:nr, c:nc, d:nd, turns, path });
    }
  }
  return null;
}

function availableMove(board: Cell[]): [Pos, Pos] | null {
  const groups = new Map<number, Pos[]>();
  board.forEach((v, i) => { if (v != null) groups.set(v, [...(groups.get(v) || []), [Math.floor(i/COLS), i%COLS]]); });
  for (const cells of groups.values()) for (let i=0;i<cells.length;i++) for (let j=i+1;j<cells.length;j++) {
    if (findPath(board, cells[i], cells[j])) return [cells[i], cells[j]];
  }
  return null;
}

export default function Home() {
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState<Cell[]>(() => newBoard(LEVELS[0].icons));
  const [selected, setSelected] = useState<Pos | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [time, setTime] = useState(LEVELS[0].time);
  const [notice, setNotice] = useState("选择两张相同的牌开始消除");
  const [hint, setHint] = useState<Pos[]>([]);
  const [won, setWon] = useState(false);
  const busy = useRef(false);

  const startLevel = useCallback((n: number) => {
    const next = newBoard(LEVELS[n].icons);
    setLevel(n); setBoard(next); setSelected(null); setHint([]);
    setTime(LEVELS[n].time); setCombo(0); setWon(false); setNotice(`第 ${n+1} 关 · ${LEVELS[n].name}`);
  }, []);

  const reshuffle = useCallback((automatic = false) => {
    setBoard(prev => {
      const positions = prev.map((v,i)=>v == null ? -1 : i).filter(i=>i>=0);
      let values = shuffle(positions.map(i=>prev[i] as number));
      let next = [...prev]; positions.forEach((p,i)=>next[p]=values[i]);
      for (let tries=0; tries<30 && !availableMove(next); tries++) {
        values = shuffle(values); next=[...prev]; positions.forEach((p,i)=>next[p]=values[i]);
      }
      return next;
    });
    setSelected(null); setHint([]); setNotice(automatic ? "牌局无解，已自动洗牌" : "牌局已重新洗牌");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(t => {
      if (won || t <= 0) return t;
      if (t === 1) { setNotice("时间到，点击重开本关"); setWon(true); }
      return t - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [won]);

  const choose = (r:number,c:number) => {
    if (busy.current || won || board[idx(r,c)] == null) return;
    setHint([]);
    if (!selected) { setSelected([r,c]); return; }
    if (selected[0]===r && selected[1]===c) { setSelected(null); return; }
    const path = findPath(board, selected, [r,c]);
    if (!path) { setSelected([r,c]); setCombo(0); setNotice(board[idx(...selected)]===board[idx(r,c)] ? "这两张牌无法连通" : "请选择相同的牌"); return; }
    busy.current = true;
    const next = [...board]; next[idx(...selected)] = null; next[idx(r,c)] = null;
    const newCombo = combo + 1; setCombo(newCombo); setScore(s => s + 100 + Math.min(newCombo, 10) * 10); setBoard(next); setSelected(null);
    setNotice(newCombo >= 3 ? `${newCombo} 连击！` : "消除成功");
    setTimeout(() => {
      busy.current = false;
      if (next.every(v=>v==null)) { setWon(true); setScore(s=>s+time*5); setNotice(level === LEVELS.length-1 ? "恭喜通关，荣登雀圣！" : "本关完成！"); }
      else if (!availableMove(next)) reshuffle(true);
    }, 220);
  };

  const showHint = () => {
    const move = availableMove(board);
    if (move) { setHint(move.flatMap(p=>[p])); setNotice("已为你标出一对可消除的牌"); }
  };

  const remaining = board.filter(v=>v!=null).length;
  return <main>
    <header className="topbar">
      <div className="brand"><span className="seal">雀</span><div><h1>雀影连连</h1><p>MAHJONG LINK</p></div></div>
      <div className="level-track" aria-label="关卡进度">{LEVELS.map((l,i)=><button key={l.name} className={i===level?"active":i<level?"done":""} onClick={()=>startLevel(i)}><b>{i+1}</b><span>{l.name}</span></button>)}</div>
      <button className="sound" aria-label="音效开关">♪</button>
    </header>

    <section className="game-shell">
      <aside className="panel info-panel">
        <div className="stage-title"><small>第 {level+1} 关</small><h2>{LEVELS[level].name}</h2><p>在时间耗尽前，消除所有麻将牌。</p></div>
        <div className="stat"><span>得分</span><strong>{score.toLocaleString()}</strong></div>
        <div className="stat"><span>剩余牌数</span><strong>{remaining}<small> / {ROWS*COLS}</small></strong></div>
        <div className="stat"><span>连击</span><strong className="red">× {combo}</strong></div>
        <div className="rule"><b>连线规则</b><p>相同麻将牌之间，通过不超过两个转角的路径即可消除。路径可以绕过棋盘外沿。</p></div>
      </aside>

      <div className="board-wrap">
        <div className="timer"><span>剩余时间</span><strong>{String(Math.floor(time/60)).padStart(2,"0")}:{String(time%60).padStart(2,"0")}</strong><div><i style={{width:`${time/LEVELS[level].time*100}%`}} /></div></div>
        <div className="board" role="grid" aria-label="7行14列麻将连连看棋盘">
          {board.map((tile,i) => {
            const r=Math.floor(i/COLS), c=i%COLS;
            const active=selected?.[0]===r&&selected?.[1]===c;
            const hinted=hint.some(p=>p[0]===r&&p[1]===c);
            return <button key={i} role="gridcell" aria-label={tile==null?"已消除":`麻将牌 ${TILES[tile]}`} className={`tile ${tile==null?"empty":""} ${active?"selected":""} ${hinted?"hinted":""}`} onClick={()=>choose(r,c)}>{tile==null?"":TILES[tile]}</button>;
          })}
        </div>
        <div className="message"><span>◆</span>{notice}<span>◆</span></div>
      </div>

      <aside className="panel action-panel">
        <button onClick={showHint}><span>灯</span><b>提示一对</b><small>显示可消除的牌</small></button>
        <button onClick={()=>reshuffle(false)}><span>洗</span><b>重新洗牌</b><small>重排剩余麻将牌</small></button>
        <button onClick={()=>startLevel(level)}><span>↻</span><b>重开本关</b><small>分数将会保留</small></button>
        <div className="auto"><i />无解时自动洗牌</div>
      </aside>
    </section>

    {won && <div className="modal-backdrop"><div className="modal"><span className="seal big">雀</span><h2>{remaining===0?notice:"本局结束"}</h2><p>{remaining===0?`本关获得时间奖励 ${time*5} 分`:`距离胜利还剩 ${remaining} 张牌`}</p><button onClick={()=>remaining===0&&level<LEVELS.length-1?startLevel(level+1):startLevel(level)}>{remaining===0&&level<LEVELS.length-1?"进入下一关":"再来一局"}</button></div></div>}
    <footer>© 雀影连连 · 一局清风，一味闲趣</footer>
  </main>;
}
