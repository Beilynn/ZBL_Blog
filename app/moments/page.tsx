import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import MomentList from './MomentList';
import { siteConfig } from '../../siteConfig';

export const metadata = {
  title: "说说 | " + siteConfig.title,
  description: "生活动态与瞬间记录",
};

export default function MomentsPage() {
  let allMoments: any[] = [];

  // 单文件兜底解析：frontmatter 解析失败时剥离原文保留正文，date 用文件名前缀，不拖垮整页
  const parseMomentFile = (fullPath: string, fileName: string) => {
    const raw = fs.readFileSync(fullPath, 'utf8');
    let data: any = {};
    let content = raw;
    try {
      const parsed = matter(raw);
      data = parsed.data || {};
      content = parsed.content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[moments] ${fileName} frontmatter 解析失败，启用兜底:`, msg);
      const block = raw.match(/^---[\s\S]*?---\s*\n?([\s\S]*)$/);
      content = block ? block[1] : raw;
      const dm = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
      data = { date: dm ? dm[1] : '', tags: [], images: [] };
    }
    return {
      id: fileName.replace(/\.md$/, ''),
      date: data.date || '',
      location: data.location || '',
      images: Array.isArray(data.images) ? data.images : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      content: (content || '').trim(),
    };
  };

  try {
    // 🌟 终极防漏绝招：同时扫描两个可能的文件夹，把所有的说说都抓出来！
    const possibleDirs = [
      path.join(process.cwd(), 'posts', 'moments'),
      path.join(process.cwd(), 'moments')
    ];

    possibleDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const fileNames = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
        fileNames.forEach(fileName => {
          try {
            allMoments.push(parseMomentFile(path.join(dir, fileName), fileName));
          } catch (fileErr) {
            const msg = fileErr instanceof Error ? fileErr.message : String(fileErr);
            console.warn(`[moments] 跳过损坏文件 ${fileName}:`, msg);
          }
        });
      }
    });

    // 去重，防止你在两个文件夹放了同名文件
    allMoments = Array.from(new Map(allMoments.map(item => [item.id, item])).values());

  } catch (e) {
    console.error("读取说说数据失败:", e);
  }

  return (
    <div className="min-h-screen relative pb-10 flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 flex flex-col">
        <MomentList
          moments={allMoments}
          authorName={siteConfig.authorName}
          avatarUrl={siteConfig.avatarUrl}
        />
      </PageTransition>
    </div>
  );
}