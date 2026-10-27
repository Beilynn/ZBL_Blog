"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function TimelineNode({ post, index }: { post: any, index: number }) {
  // 判断是放在左边还是右边（偶数左，奇数右）
  const isLeft = index % 2 === 0;

  // 外链作品：新标签打开；普通文章：站内路由跳转
  const Wrap: any = post.external ? "a" : Link;
  const wrapProps = post.external
    ? { href: post.url, target: "_blank", rel: "noopener noreferrer" }
    : { href: `/posts/${post.slug}` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`mb-12 flex justify-between items-center w-full ${isLeft ? 'md:flex-row-reverse' : 'flex-row'}`}
    >
      {/* 留出对面的一半空白 */}
      <div className="order-1 w-5/12 hidden md:block"></div>

      {/* 中间的圆形节点 */}
      <div className="z-20 flex items-center justify-center order-1 bg-white shadow-xl w-6 h-6 rounded-full border-4 border-orange-400 ring-4 ring-orange-200/50 transition-colors duration-1000"></div>

      {/* 卡片实体 */}
      <Wrap {...wrapProps} className="order-1 w-full md:w-5/12 group block">
        <div className="bg-[#fdf6ec]/80 backdrop-blur-lg rounded-3xl shadow-lg border border-[#e8d5c4]/50 transition-all duration-500 hover:scale-[1.03] hover:bg-[#fdf6ec] hover:shadow-2xl overflow-hidden flex flex-col">

          {/* 上半部分：有封面图用图片横幅，否则回退 emoji 渐变横幅 */}
          {post.cover ? (
            <div className="w-full h-40 sm:h-48 overflow-hidden relative bg-[#e8d5c4]">
              <img
                src={post.cover}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              {post.external && (
                <span className="absolute top-3 right-3 text-white bg-white/25 backdrop-blur-sm rounded-full p-1.5 flex items-center justify-center">
                  <ArrowUpRight size={15} />
                </span>
              )}
            </div>
          ) : (
            <div className="w-full h-40 sm:h-48 relative overflow-hidden bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <span className="text-5xl drop-shadow-md">{post.icon}</span>
              <span className="absolute top-3 right-3 text-white bg-white/25 backdrop-blur-sm rounded-full p-1.5 flex items-center justify-center">
                <ArrowUpRight size={15} />
              </span>
            </div>
          )}

          {/* 下半部分：文本信息 */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              {post.external ? (
                <span className="text-orange-600 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpRight size={12} /> 在线作品 · {post.date}
                </span>
              ) : (
                <div className="text-orange-600 font-bold text-[11px] flex items-center gap-1 uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {post.date}
                </div>
              )}
            </div>

            <h3 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h3>

            {/* 文章标签展示 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-500/10 text-orange-600 border border-orange-500/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
              {post.description}
            </p>
          </div>

        </div>
      </Wrap>
    </motion.div>
  );
}
