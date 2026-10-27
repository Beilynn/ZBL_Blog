"use client";

import { useEffect, useState } from "react";

type PsyNewsItem = {
  id: string;
  title: string;
  link: string;
  summary: string;
  source: string;
  category: string;
  dateText: string;
};

// 首页中间列：心理学前沿动态（数据来自 /api/psynews，服务端读取 PsyHOT RSS）
export default function PsyNews() {
  const [items, setItems] = useState<PsyNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/psynews")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        const list: PsyNewsItem[] = data.items || [];
        setItems(list);
        setFailed(list.length === 0);
        setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="bg-[#fdf6ec]/90 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-lg">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>🧠</span>
          心理学前沿动态
        </h3>
        <a
          href="https://psyhot.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
        >
          前往 PsyHOT ↗
        </a>
      </div>

      {/* 加载骨架 */}
      {loading && (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2].map((n) => (
            <li
              key={n}
              className="p-4 rounded-2xl bg-white/50 border border-[#e8d5c4]/60 animate-pulse"
            >
              <div className="h-3 w-1/3 rounded bg-[#e8d5c4] mb-2" />
              <div className="h-3.5 w-full rounded bg-[#ead9c8] mb-1.5" />
              <div className="h-3.5 w-4/5 rounded bg-[#ead9c8]" />
            </li>
          ))}
        </ul>
      )}

      {/* 失败兜底：不白屏，给出直达入口 */}
      {!loading && failed && (
        <div className="text-sm text-slate-500 leading-relaxed p-4 rounded-2xl bg-white/60 border border-[#e8d5c4]/60">
          暂时无法获取最新动态，请稍后刷新，或直接访问
          <a
            href="https://psyhot.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600 ml-1"
          >
            PsyHOT ↗
          </a>
        </div>
      )}

      {/* 动态列表：新标签页跳转原文，不离开本站 */}
      {!loading && items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-2xl bg-white/60 hover:bg-white transition-colors duration-300 border border-[#e8d5c4]/60 hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-1.5 text-[11px] flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-semibold">
                    {item.source}
                  </span>
                  {item.category && (
                    <span className="text-slate-400">{item.category}</span>
                  )}
                  <span className="ml-auto text-slate-400">{item.dateText}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1.5 line-clamp-2">
                  {item.title}
                </h4>
                {item.summary && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
