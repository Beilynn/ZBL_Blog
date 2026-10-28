"use client";

import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import BackButton from '../../components/BackButton';

const API = 'http://127.0.0.1:4100';

// ---------- 轻量 Markdown 预览（仅辅助预览，正式渲染由详情页 remark 栈完成） ----------
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inlineMd(s: string) {
  let out = escapeHtml(s);
  out = out.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[13px]">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-2 max-w-full" />');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-orange-600 underline">$1</a>');
  return out;
}
function renderMd(md: string) {
  const blocks = md.split('```');
  return blocks.map((block, i) => {
    if (i % 2 === 1) {
      const code = block.replace(/^[a-zA-Z0-9]*\n/, '');
      return `<pre class="bg-slate-800 text-slate-100 rounded-xl p-3 text-[13px] overflow-x-auto my-2"><code>${escapeHtml(code)}</code></pre>`;
    }
    const lines = block.split('\n');
    const html: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    const closeList = () => {
      if (listType) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); listType = null; }
    };
    for (const raw of lines) {
      if (/^\s*```/.test(raw)) continue;
      if (/^\s*$/.test(raw)) { closeList(); continue; }
      let m: RegExpMatchArray | null;
      if ((m = raw.match(/^(#{1,3})\s+(.*)$/))) {
        closeList();
        const lvl = m[1].length;
        const cls = lvl === 1 ? 'text-xl font-extrabold mt-3 mb-1' : lvl === 2 ? 'text-lg font-bold mt-3 mb-1' : 'text-base font-bold mt-2 mb-1';
        html.push(`<h${lvl} class="${cls}">${inlineMd(m[2])}</h${lvl}>`);
        continue;
      }
      if ((m = raw.match(/^>\s?(.*)$/))) {
        closeList();
        html.push(`<blockquote class="border-l-4 border-orange-300 bg-orange-50/60 italic text-slate-600 pl-3 py-1 my-1 rounded-r-lg">${inlineMd(m[1])}</blockquote>`);
        continue;
      }
      if (/^\s*[-*]\s+/.test(raw)) {
        if (listType !== 'ul') { closeList(); html.push('<ul class="list-disc pl-5 my-1 space-y-0.5">'); listType = 'ul'; }
        html.push(`<li>${inlineMd(raw.replace(/^\s*[-*]\s+/, ''))}</li>`);
        continue;
      }
      if ((m = raw.match(/^\s*\d+\.\s+(.*)$/))) {
        if (listType !== 'ol') { closeList(); html.push('<ol class="list-decimal pl-5 my-1 space-y-0.5">'); listType = 'ol'; }
        html.push(`<li>${inlineMd(m[1])}</li>`);
        continue;
      }
      if (/^\s*---+\s*$/.test(raw)) { closeList(); html.push('<hr class="my-3 border-orange-200" />'); continue; }
      closeList();
      html.push(`<p class="my-1 leading-relaxed">${inlineMd(raw)}</p>`);
    }
    closeList();
    return html.join('');
  }).join('');
}

function defaultDate() {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} 10:00:00`;
}

const CATEGORIES = ['个人简历', '文献阅读', '项目'];

// 说说常用表情：纯文本，点击插入到正文光标处
const MOMENT_EMOJIS = [
  '😀', '😄', '😂', '🥰', '😍', '😊', '😅', '😉',
  '😜', '🤔', '😴', '🥱', '😭', '😡', '🤗', '🙌',
  '👍', '👏', '🔥', '✨', '🌙', '☀️', '🌧️', '🎉',
  '📚', '✍️', '🍰', '☕', '🐱', '🐟', '🌿', '💪',
];

export default function EditorPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [date, setDate] = useState(defaultDate());
  const [category, setCategory] = useState('文献阅读');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState('');
  const [body, setBody] = useState('## 一、小标题\n\n在这里写正文，支持 Markdown 语法。\n');

  // 内容类型：article 归档文章（posts）/ moment 生活说说（moments）
  const [kind, setKind] = useState<'article' | 'moment'>('article');
  const [momentText, setMomentText] = useState('');
  const [momentLocation, setMomentLocation] = useState('');
  const [momentImagesText, setMomentImagesText] = useState('');
  const [momentTags, setMomentTags] = useState<string[]>([]);
  const [momentTagInput, setMomentTagInput] = useState('');
  const momentTextRef = useRef<HTMLTextAreaElement>(null);

  const [status, setStatus] = useState<{ type: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // 加载草稿列表
  const refreshDrafts = async () => {
    try {
      const res = await fetch(`${API}/api/list`);
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch { /* 服务未启动时静默 */ }
  };
  useEffect(() => { refreshDrafts(); }, []);

  // 工具栏：包裹选区
  const wrap = (before: string, after = '', placeholder = '内容') => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = body.slice(s, e) || placeholder;
    setBody(body.slice(0, s) + before + sel + after + body.slice(e));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd = s + before.length + sel.length;
    });
  };
  // 工具栏：行首加前缀
  const linePrefix = (prefix: string) => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart;
    const lineStart = body.lastIndexOf('\n', s - 1) + 1;
    setBody(body.slice(0, lineStart) + prefix + body.slice(lineStart));
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + prefix.length; });
  };

  const addTag = () => {
    const v = tagInput.trim().replace(/,/g, '');
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput('');
  };

  const save = async (mode: 'draft' | 'publish') => {
    if (!title.trim()) { setStatus({ type: 'err', text: '请先填写文章标题' }); return; }
    setBusy(true);
    setStatus({ type: 'info', text: mode === 'draft' ? '正在保存草稿…' : '正在写入正式文章…' });
    try {
      const res = await fetch(`${API}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, title, slug, date, category, tags, description, cover, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'err', text: data.error || '保存失败，请确认已运行 npm run editor' });
      } else {
        setStatus({
          type: 'ok',
          text: mode === 'draft'
            ? `草稿已保存：${data.relative}（不进入时间线，可随时继续编辑）`
            : `正式文章已写入：${data.relative}（git 提交推送后上线 /timeline）`,
        });
        refreshDrafts();
      }
    } catch {
      setStatus({ type: 'err', text: '无法连接写盘服务：请先在终端运行 npm run editor（会同时启动站点与写盘服务）' });
    } finally {
      setBusy(false);
    }
  };

  const openDraft = async (file: string) => {
    try {
      const res = await fetch(`${API}/api/read?dir=drafts&file=${encodeURIComponent(file)}`);
      const data = await res.json();
      if (!data.ok) return;
      setTitle(data.meta.title || '');
      setSlug(file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''));
      setDate(data.meta.date || defaultDate());
      setCategory(data.meta.category || '文献阅读');
      setTags(data.meta.tags || []);
      setDescription(data.meta.description || '');
      setCover(data.meta.cover || '');
      setBody(data.body || '');
      setStatus({ type: 'info', text: `已载入草稿：${file}` });
    } catch {
      setStatus({ type: 'err', text: '载入草稿失败' });
    }
  };

  // 说说标签：回车或按钮添加，去重
  const addMomentTag = () => {
    const v = momentTagInput.trim().replace(/,/g, '');
    if (v && !momentTags.includes(v)) setMomentTags([...momentTags, v]);
    setMomentTagInput('');
  };

  // 在说说正文光标处插入表情，并把光标移到表情之后
  const insertMomentEmoji = (emoji: string) => {
    const el = momentTextRef.current;
    const start = el?.selectionStart ?? momentText.length;
    const end = el?.selectionEnd ?? momentText.length;
    const next = momentText.slice(0, start) + emoji + momentText.slice(end);
    setMomentText(next);
    requestAnimationFrame(() => {
      if (el) {
        const pos = start + emoji.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  };

  // 生活说说：直接写入 moments/，无草稿、无详情页
  const saveMoment = async () => {
    if (!momentText.trim()) { setStatus({ type: 'err', text: '说说正文不能为空' }); return; }
    setBusy(true);
    setStatus({ type: 'info', text: '正在保存说说…' });
    try {
      const images = momentImagesText.split('\n').map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`${API}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'moment', date, location: momentLocation, images, tags: momentTags, body: momentText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'err', text: data.error || '保存失败，请确认已运行 npm run editor' });
      } else {
        setStatus({ type: 'ok', text: `说说已保存：${data.relative}（刷新 /moments 查看）` });
        setMomentText(''); setMomentImagesText(''); setMomentLocation('');
        setMomentTags([]); setMomentTagInput('');
      }
    } catch {
      setStatus({ type: 'err', text: '无法连接写盘服务：请先在终端运行 npm run editor' });
    } finally {
      setBusy(false);
    }
  };

  const toolBtn = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-white/70 hover:bg-orange-100 text-slate-600 border border-[#e8d5c4] transition-colors';

  // 线上生产环境不提供写盘能力，仅展示提示（hooks 已在上方无条件执行，顺序稳定）
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen relative pb-32">
        <Navbar />
        <main className="w-[95%] max-w-3xl mx-auto mt-32 text-center">
          <h1 className="text-2xl font-bold text-slate-700 mb-3">写作台</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            写作台仅在本地开发环境使用：请在项目目录运行{' '}
            <code className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded">npm run editor</code>{' '}
            后访问 /editor；线上站点不提供写盘能力。
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-32">
      <Navbar />
      <PageTransition>
        <main className="w-[95%] max-w-7xl mx-auto mt-24 md:mt-28">
          <BackButton />

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">写作台</h1>
            <p className="text-sm text-slate-500 mt-1">本机可视化写作：草稿存 drafts/（不进时间线），正式发布写入 posts/（进入 /timeline）。</p>
          </header>

          {status && (
            <div className={`mb-4 px-4 py-3 rounded-2xl text-sm font-medium border ${
              status.type === 'ok' ? 'bg-green-50 text-green-700 border-green-200'
              : status.type === 'err' ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}>{status.text}</div>
          )}

          <div className="mb-5 inline-flex bg-[#f5ebe0] p-1 rounded-xl border border-[#e8d5c4]/60 shadow-sm">
            <button onClick={() => setKind('article')}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs font-black transition-all duration-300 ${kind === 'article' ? 'bg-orange-500 text-white shadow-md scale-105' : 'text-slate-500 hover:text-orange-500'}`}>
              归档文章
            </button>
            <button onClick={() => setKind('moment')}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-xs font-black transition-all duration-300 ${kind === 'moment' ? 'bg-orange-500 text-white shadow-md scale-105' : 'text-slate-500 hover:text-orange-500'}`}>
              生活说说
            </button>
          </div>

          {kind === 'article' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左：标题 + 工具栏 + 双栏编辑 */}
            <section className="flex-1 min-w-0 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="文章大标题…"
                className="w-full text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-[#e8d5c4] focus:border-orange-400 outline-none py-2 placeholder:text-slate-400 text-slate-800"
              />

              <div className="flex flex-wrap gap-1.5 items-center">
                <button className={toolBtn} onClick={() => linePrefix('# ')}>H1</button>
                <button className={toolBtn} onClick={() => linePrefix('## ')}>H2</button>
                <button className={toolBtn} onClick={() => linePrefix('### ')}>H3</button>
                <span className="w-px h-4 bg-[#e8d5c4] mx-1" />
                <button className={toolBtn} onClick={() => wrap('**', '**', '加粗')}>B</button>
                <button className={toolBtn} onClick={() => wrap('*', '*', '斜体')}>I</button>
                <span className="w-px h-4 bg-[#e8d5c4] mx-1" />
                <button className={toolBtn} onClick={() => linePrefix('> ')}>引用</button>
                <button className={toolBtn} onClick={() => linePrefix('- ')}>列表</button>
                <button className={toolBtn} onClick={() => linePrefix('1. ')}>编号</button>
                <span className="w-px h-4 bg-[#e8d5c4] mx-1" />
                <button className={toolBtn} onClick={() => wrap('```\n', '\n```', '代码')}>代码块</button>
                <button className={toolBtn} onClick={() => wrap('[', '](https://)', '链接文字')}>链接</button>
                <button className={toolBtn} onClick={() => wrap('![', '](https://)', '描述')}>图片</button>
                <button className={toolBtn} onClick={() => setBody(body + '\n---\n')}>分割线</button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <textarea
                  ref={taRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  spellCheck={false}
                  placeholder="在此编写 Markdown 正文…"
                  className="min-h-[420px] w-full bg-white/70 backdrop-blur rounded-2xl p-4 text-sm leading-relaxed font-mono outline-none border border-[#e8d5c4] focus:border-orange-300 resize-y"
                />
                <div
                  className="min-h-[420px] bg-white/60 backdrop-blur rounded-2xl p-4 text-sm overflow-auto border border-[#e8d5c4]"
                  dangerouslySetInnerHTML={{ __html: renderMd(body) }}
                />
              </div>
            </section>

            {/* 右：属性面板 */}
            <aside className="w-full lg:w-80 shrink-0 space-y-4">
              <div className="bg-[#fdf6ec]/80 backdrop-blur-lg rounded-3xl border border-[#e8d5c4]/60 p-5 space-y-4">
                <h2 className="font-bold text-slate-700 text-sm tracking-wide">属性设置</h2>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">归档大类</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">写作时间</label>
                  <input value={date} onChange={(e) => setDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">英文标识 slug（留空自动生成）</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)}
                    placeholder="如 cognitive-experiment"
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">标签（回车添加）</label>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="如 心理学"
                      className="flex-1 bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none" />
                    <button onClick={addTag} className="px-3 rounded-xl text-sm font-bold bg-orange-100 text-orange-700">添加</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/10">
                        #{t}
                        <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">卡片摘要（时间线简介）</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    placeholder="记录这篇内容的核心思路…"
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">封面图（留空用默认封面）</label>
                  <input value={cover} onChange={(e) => setCover(e.target.value)}
                    placeholder="/works/x.png 或 https://…"
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button disabled={busy} onClick={() => save('draft')}
                  className="px-4 py-3 rounded-2xl text-sm font-bold bg-white/80 text-slate-600 border border-[#e8d5c4] hover:bg-white transition-colors disabled:opacity-50">
                  存为草稿
                </button>
                <button disabled={busy} onClick={() => save('publish')}
                  className="px-4 py-3 rounded-2xl text-sm font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors disabled:opacity-50">
                  正式发布
                </button>
              </div>

              {drafts.length > 0 && (
                <div className="bg-[#fdf6ec]/80 backdrop-blur-lg rounded-3xl border border-[#e8d5c4]/60 p-5">
                  <h2 className="font-bold text-slate-700 text-sm mb-3">草稿箱（{drafts.length}）</h2>
                  <ul className="space-y-2">
                    {drafts.map((d) => (
                      <li key={d.file}>
                        <button onClick={() => openDraft(d.file)}
                          className="w-full text-left px-3 py-2 rounded-xl bg-white/70 hover:bg-orange-50 border border-[#e8d5c4]/60 transition-colors">
                          <div className="text-sm font-bold text-slate-700 truncate">{d.title}</div>
                          <div className="text-[11px] text-slate-400">{d.date}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
          )}

          {kind === 'moment' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <section className="flex-1 min-w-0 space-y-3">
              <div className="bg-[#fdf6ec]/80 backdrop-blur-lg rounded-2xl border border-[#e8d5c4]/60 p-3">
                <div className="grid grid-cols-8 gap-1">
                  {MOMENT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => insertMomentEmoji(e)}
                      title="插入表情"
                      className="text-lg leading-none py-1 rounded-lg hover:bg-orange-100 active:scale-90 transition-all"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                ref={momentTextRef}
                value={momentText}
                onChange={(e) => setMomentText(e.target.value)}
                placeholder="此刻想记录的一句话或一段心情…（纯文本，支持换行，展示在 /moments 生活动态）"
                className="min-h-[320px] w-full bg-white/70 backdrop-blur rounded-2xl p-4 text-sm leading-relaxed outline-none border border-[#e8d5c4] focus:border-orange-300 resize-y whitespace-pre-wrap"
              />
            </section>

            <aside className="w-full lg:w-80 shrink-0 space-y-4">
              <div className="bg-[#fdf6ec]/80 backdrop-blur-lg rounded-3xl border border-[#e8d5c4]/60 p-5 space-y-4">
                <h2 className="font-bold text-slate-700 text-sm tracking-wide">说说设置</h2>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">发布时间</label>
                  <input value={date} onChange={(e) => setDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">定位（可留空）</label>
                  <input value={momentLocation} onChange={(e) => setMomentLocation(e.target.value)}
                    placeholder="如 宁波大学"
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">标签（回车添加，可留空）</label>
                  <div className="flex gap-2">
                    <input value={momentTagInput} onChange={(e) => setMomentTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMomentTag(); } }}
                      placeholder="如 日常"
                      className="flex-1 bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none" />
                    <button onClick={addMomentTag} className="px-3 rounded-xl text-sm font-bold bg-orange-100 text-orange-700">添加</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {momentTags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/10">
                        #{t}
                        <button onClick={() => setMomentTags(momentTags.filter((x) => x !== t))} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-600 mb-1">配图 URL（每行一张，可留空）</label>
                  <textarea value={momentImagesText} onChange={(e) => setMomentImagesText(e.target.value)} rows={4}
                    placeholder={'https://…\n或 public 路径，如 /works/x.png'}
                    className="w-full bg-white/80 rounded-xl px-3 py-2 text-sm border border-[#e8d5c4] outline-none resize-none" />
                </div>
              </div>

              <button disabled={busy} onClick={saveMoment}
                className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors disabled:opacity-50">
                保存说说
              </button>
              <p className="text-[11px] text-slate-400 leading-relaxed px-1">
                说说直接写入 moments/，刷新 /moments 生活动态即可看到；无需草稿，随写随存。
              </p>
            </aside>
          </div>
          )}
        </main>
      </PageTransition>
    </div>
  );
}
