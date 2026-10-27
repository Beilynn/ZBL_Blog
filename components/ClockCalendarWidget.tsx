"use client";

import { useEffect, useState } from 'react';

export default function ClockCalendarWidget() {
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
      <div className="bg-[#fdf6ec] rounded-3xl p-5 shadow-lg text-center">
        <div className="text-3xl font-bold text-slate-900 tracking-wider font-mono">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* 日历卡片 */}
      <div className="bg-[#fdf6ec] backdrop-blur-md rounded-3xl p-6 shadow-lg">
        <h3 className="font-bold text-slate-800 mb-4">
          {today.getFullYear()}年{today.getMonth() + 1}月
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          <div className="text-slate-500 mb-2">日</div>
          <div className="text-slate-500 mb-2">一</div>
          <div className="text-slate-500 mb-2">二</div>
          <div className="text-slate-500 mb-2">三</div>
          <div className="text-slate-500 mb-2">四</div>
          <div className="text-slate-500 mb-2">五</div>
          <div className="text-slate-500 mb-2">六</div>
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`py-1 rounded-full ${day === todayDate ? 'bg-orange-500 text-white font-bold' : 'text-slate-700'}`}
            >
              {day || ''}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
