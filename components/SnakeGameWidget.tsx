"use client";

import { useState, useEffect, useRef } from 'react';

const GRID = 15;
const CELL = 14;

type Dot = { x: number; y: number };

export default function SnakeGameWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  
  const snakeRef = useRef<Dot[]>([{ x: 7, y: 7 }]);
  const foodRef = useRef<Dot>({ x: 10, y: 10 });
  const dirRef = useRef<Dot>({ x: 1, y: 0 });
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  // 画游戏
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 背景
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 食物
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(foodRef.current.x * CELL + CELL/2, foodRef.current.y * CELL + CELL/2, CELL/2 - 1, 0, Math.PI*2);
    ctx.fill();

    // 蛇
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#f97316' : '#fb923c';
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
  };

  // 生成食物
  const newFood = () => {
    let f: Dot;
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snakeRef.current.some(s => s.x === f.x && s.y === f.y));
    foodRef.current = f;
  };

  // 游戏循环
  const tick = () => {
    const head = { ...snakeRef.current[0] };
    head.x += dirRef.current.x;
    head.y += dirRef.current.y;

    // 撞墙
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      setOver(true);
      setRunning(false);
      if (loopRef.current) clearInterval(loopRef.current);
      return;
    }

    // 撞自己
    if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
      setOver(true);
      setRunning(false);
      if (loopRef.current) clearInterval(loopRef.current);
      return;
    }

    snakeRef.current.unshift(head);

    // 吃食物
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => s + 10);
      newFood();
    } else {
      snakeRef.current.pop();
    }

    draw();
  };

  // 开始游戏
  const startGame = () => {
    snakeRef.current = [{ x: 7, y: 7 }];
    dirRef.current = { x: 1, y: 0 };
    setScore(0);
    setOver(false);
    setRunning(true);
    newFood();
    draw();

    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(tick, 150);
  };

  // 键盘控制
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (dirRef.current.y !== 1) dirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (dirRef.current.y !== -1) dirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (dirRef.current.x !== 1) dirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (dirRef.current.x !== -1) dirRef.current = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);

  // 初始化画一次
  useEffect(() => {
    draw();
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-[#fdf6ec] rounded-3xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-700 text-sm">🐍 贪吃蛇</h3>
        <span className="text-sm font-bold text-orange-500">{score} 分</span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={GRID * CELL}
        height={GRID * CELL}
        className="rounded-xl mx-auto block border border-[#e8d5c4]"
      />
      
      <div className="mt-3 text-center">
        {!running && !over && (
          <button
            onClick={startGame}
            className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            ▶ 开始游戏
          </button>
        )}
        {over && (
          <div>
            <div className="text-red-500 font-bold mb-2">游戏结束！{score} 分</div>
            <button
              onClick={startGame}
              className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
            >
              🔄 再来一局
            </button>
          </div>
        )}
        {running && (
          <div className="text-xs text-slate-500">↑↓←→ / WASD 控制方向</div>
        )}
      </div>
    </div>
  );
}
