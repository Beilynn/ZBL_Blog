"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/BackButton';
import { projectsData } from '../../data/projects';

function GithubIcon() {
  return (
    <svg
      className="w-6 h-6 text-slate-400 group-hover:text-slate-800 transition-colors flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      className="w-6 h-6 text-slate-400 group-hover:text-orange-500 transition-colors flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1.5 1.5M14 10a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1.5-1.5"
      />
    </svg>
  );
}

export default function ProjectsBoard() {
  const [searchQuery, setSearchQuery] = useState("");

  // 搜索过滤逻辑
  const filteredProjects = useMemo(() => {
    if (searchQuery.trim() === "") return projectsData;
    const query = searchQuery.trim().toLowerCase();

    return projectsData.filter((project) =>
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-10 py-10 relative z-10">
      {/* 顶部返回按钮与标题 */}
      <div className="mb-8 flex flex-col items-center md:items-start">
        <div className="w-full flex justify-start">
          <BackButton className="mb-6" />
        </div>
        <div className="text-center md:text-left w-full">
          <h1 className="text-5xl font-black text-slate-800 mb-6 tracking-wider">
            Projects Matrix
          </h1>
          <p className="text-slate-600 font-serif text-base">
            开源项目 · 学习资料
          </p>
        </div>
      </div>

      {/* 居中的搜索框 */}
      <div className="mb-10 flex justify-center w-full">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="搜索项目名称、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fdf6ec]/80 backdrop-blur-md border border-[#e8d5c4] rounded-full px-6 py-3 pl-12 text-slate-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-300 transition-all placeholder-slate-400"
          />
          <svg
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 卡片矩阵：两列，等高排列 */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key={project.id}
              className="h-full"
            >
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-full flex-col rounded-3xl bg-[#fdf6ec]/90 backdrop-blur-md border border-[#e8d5c4]/80 shadow-lg p-6 md:p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-200/50 hover:border-orange-200"
              >
                {/* 装饰光晕 */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-400/20 transition-colors duration-500" />

                {/* 标题行：图标方块 + 名称 + 类型图标 */}
                <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-2xl shadow-md shadow-orange-200/60 flex-shrink-0">
                      {project.icon}
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-orange-600 transition-colors">
                      {project.name}
                    </h2>
                  </div>
                  {project.kind === 'github' ? <GithubIcon /> : <ExternalIcon />}
                </div>

                {/* 描述：弹性占满，标签沉底，保证同行卡片等高 */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5 relative z-10 flex-1">
                  {project.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-full border border-orange-200/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-20 text-slate-500 w-full"
          >
            没有找到与「{searchQuery}」相关的内容，换个关键词试试吧。
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
