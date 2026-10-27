"use client";

import { useEffect, useState } from 'react';

export default function SiteWidgets() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [today, setToday] = useState(new Date());

  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 格式化时间
  const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // 获取当月日历
  const getCalendarDays = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: (number | null)[] = [];
    
    // 前面补空
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();
  const todayDate = today.getDate();

  return (
    <>
      {/* 时间卡片 */}
      <div className="bg-[#fdf6ec]/90 backdrop-blur-md rounded-3xl p-6 shadow-lg text-center">
        <div className="text-4xl font-bold text-slate-800 tracking-wider font-mono">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* 天气卡片 */}
      <div className="bg-[#fdf6ec] backdrop-blur-md rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-slate-700 mb-1">📍 宁波市</div>
            <div className="text-5xl font-bold text-slate-900 mt-2">20°</div>
            <div className="text-sm text-slate-800 mt-1">局部多云</div>
            <div className="text-xs text-slate-600 mt-1">最高 22° · 最低 17°</div>
          </div>
          <div className="text-6xl">⛅</div>
        </div>
        
        <div className="border-t border-[#e8d5c4] my-4"></div>
        
        <div className="text-xs text-slate-700 mb-3">逐小时预报</div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <div className="text-xs text-orange-600 font-bold mb-1">现在</div>
            <div className="text-2xl mb-1">⛅</div>
            <div className="text-sm font-bold text-slate-900">20°</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600 mb-1">20时</div>
            <div className="text-2xl mb-1">⛅</div>
            <div className="text-sm font-bold text-slate-900">20°</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600 mb-1">21时</div>
            <div className="text-2xl mb-1">🌙</div>
            <div className="text-sm font-bold text-slate-900">19°</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600 mb-1">22时</div>
            <div className="text-2xl mb-1">🌙</div>
            <div className="text-sm font-bold text-slate-900">19°</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-[#f5ebe0] rounded-xl p-2">
            <div className="text-xs text-slate-600 mb-1">体感</div>
            <div className="text-sm font-bold text-slate-900">20°</div>
          </div>
          <div className="text-center bg-[#f5ebe0] rounded-xl p-2">
            <div className="text-xs text-slate-600 mb-1">湿度</div>
            <div className="text-sm font-bold text-slate-900">73%</div>
          </div>
          <div className="text-center bg-[#f5ebe0] rounded-xl p-2">
            <div className="text-xs text-slate-600 mb-1">风速</div>
            <div className="text-sm font-bold text-slate-900">11 km/h</div>
          </div>
        </div>
      </div>

      {/* 日历卡片 */}
      <div className="bg-[#fdf6ec]/90 backdrop-blur-md rounded-3xl p-6 shadow-lg">
        <h3 className="font-bold text-slate-700 mb-4">
          {today.getFullYear()}年{today.getMonth() + 1}月
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          <div className="text-slate-400 mb-2">日</div>
          <div className="text-slate-400 mb-2">一</div>
          <div className="text-slate-400 mb-2">二</div>
          <div className="text-slate-400 mb-2">三</div>
          <div className="text-slate-400 mb-2">四</div>
          <div className="text-slate-400 mb-2">五</div>
          <div className="text-slate-400 mb-2">六</div>
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`py-1 rounded-full ${day === todayDate ? 'bg-orange-500 text-white font-bold' : 'text-slate-600'}`}
            >
              {day || ''}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
