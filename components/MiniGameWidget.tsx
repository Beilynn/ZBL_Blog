"use client";

import { useState } from 'react';

export default function MiniGameWidget() {
  const [score, setScore] = useState(0);
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = () => {
    setScore(score + 1);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 100);
  };

  return (
    <div className="w-full bg-[#fdf6ec] rounded-3xl p-5 shadow-lg text-center">
      <h3 className="font-bold text-slate-700 mb-3 text-sm">🎮 点猫猫小游戏</h3>
      
      <div 
        onClick={handleClick}
        className={`text-6xl cursor-pointer select-none transition-transform duration-100 ${isClicking ? 'scale-125' : 'scale-100'} hover:scale-110`}
      >
        🐱
      </div>
      
      <div className="mt-3">
        <div className="text-2xl font-bold text-orange-500">{score}</div>
        <div className="text-xs text-slate-500">分</div>
      </div>
      
      <div className="mt-2 text-xs text-slate-400">
        {score === 0 && '点击猫猫得分！'}
        {score > 0 && score < 10 && '不错哦，继续点！'}
        {score >= 10 && score < 30 && '手速很快嘛！'}
        {score >= 30 && '键盘侠本侠！'}
        {score >= 50 && '你是点猫猫大师！'}
      </div>
    </div>
  );
}
