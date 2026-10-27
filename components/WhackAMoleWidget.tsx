"use client";

import { useState, useEffect } from 'react';

const HOLES = 9;

export default function WhackAMoleWidget() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeHole, setActiveHole] = useState<number | null>(null);

  // 游戏倒计时
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          setActiveHole(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // 地鼠出现
  useEffect(() => {
    if (!isPlaying) return;

    const moleTimer = setInterval(() => {
      setActiveHole(Math.floor(Math.random() * HOLES));
      // 0.8秒后消失
      setTimeout(() => setActiveHole(null), 800);
    }, 1000);

    return () => clearInterval(moleTimer);
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const hitMole = (index: number) => {
    if (index === activeHole) {
      setScore(s => s + 1);
      setActiveHole(null);
    }
  };

  return (
    <div className="w-full bg-[#fdf6ec] rounded-3xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-slate-700 text-sm">🔨 打地鼠</h3>
        <div className="flex gap-3 text-sm">
          <span className="font-bold text-orange-500">{score} 分</span>
          <span className="font-bold text-slate-600">{timeLeft}s</span>
        </div>
      </div>
      
      {!isPlaying ? (
        <div className="text-center py-6">
          {timeLeft === 0 ? (
            <>
              <div className="text-slate-700 font-bold mb-3">游戏结束！你打了 {score} 只地鼠！</div>
              <button
                onClick={startGame}
                className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                🔄 再来一局
              </button>
            </>
          ) : (
            <button
              onClick={startGame}
              className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
            >
              ▶ 开始游戏
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: HOLES }).map((_, i) => (
            <button
              key={i}
              onClick={() => hitMole(i)}
              className="aspect-square rounded-xl bg-[#f5ebe0] hover:bg-[#e8d5c4] transition-colors flex items-center justify-center text-3xl"
            >
              {activeHole === i ? '🐹' : ''}
            </button>
          ))}
        </div>
      )}
      
      {isPlaying && (
        <div className="mt-3 text-center text-xs text-slate-500">
          点击出现的地鼠得分！
        </div>
      )}
    </div>
  );
}
