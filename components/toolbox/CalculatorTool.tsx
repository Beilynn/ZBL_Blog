"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CalculatorTool() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }

    if (display === 'Error') {
      if (['+', '-', '*', '/'].includes(val) || val === '=') {
        setDisplay('0');
        setEquation('');
        return;
      } else {
        setDisplay(val === '.' ? '0.' : val);
        setEquation('');
        return;
      }
    }

    if (val === '=') {
      try {
        const fullEq = equation + display;
        const safeEq = fullEq.replace(/[^-()\d/*+.]/g, '');
        const result = new Function('return ' + safeEq)();
        setDisplay(String(parseFloat(Number(result).toFixed(6))));
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
    }
    else if (['+', '-', '*', '/'].includes(val)) {
      if (display === '0' && equation && ['+', '-', '*', '/'].includes(equation.slice(-1))) {
        setEquation(equation.slice(0, -1) + val);
      } else {
        setEquation(equation + display + val);
        setDisplay('0');
      }
    }
    else {
      if (val === '.' && display.includes('.')) return;
      setDisplay(display === '0' && val !== '.' ? val : display + val);
    }
  };

  const calcButtons = [
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-3"
    >
      {/* 【显示屏扩容】：高度提升到 h-20，增加内边距 p-4 */}
      <div className="bg-[#f5ebe0] rounded-2xl p-4 flex flex-col items-end justify-center h-24 shadow-inner border border-[#e8d5c4]">
        {/* 公式字号放大到 text-sm */}
        <span className="text-sm text-slate-400 tracking-wider h-5 mb-1">{equation}</span>
        {/* 主数字字号放大到 text-4xl */}
        <span className="text-4xl font-black text-slate-800 truncate w-full text-right">{display}</span>
      </div>

      {/* 键盘 */}
      <div className="grid grid-cols-4 gap-2 mt-1">
        {calcButtons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleCalcClick(btn)}
            className={`h-10 rounded-xl text-sm font-bold flex items-center justify-center shadow-sm active:scale-95 transition-all
              ${btn === '=' ? 'col-span-2 bg-orange-500 text-white hover:bg-orange-600'
              : ['C', '(', ')', '/', '*', '-', '+'].includes(btn) ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'
              : 'bg-white/80 text-slate-700 hover:bg-white'}
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </motion.div>
  );
}