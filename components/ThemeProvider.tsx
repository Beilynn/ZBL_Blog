"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 站点统一浅色主题，固定关闭深色模式
  const [isDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 清除历史可能残留的深色记录，并确保根节点不带 dark 类
    localStorage.removeItem('blog-theme');
    document.documentElement.classList.remove('dark');
  }, []);

  // 挂载完成前隐藏内容，避免主题闪烁
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
