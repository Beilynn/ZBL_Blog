import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';
import TimelineClient from '../../components/TimelineClient';
import { featuredLinks } from '../../data/featured';
// 🌟 1. 引入 ToastProvider 喵！
import { ToastProvider } from '../../components/ToastProvider';

export const metadata = {
  title: "归档与探索 | " + siteConfig.title,
};

export default function Timeline() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let posts: any[] = [];
  let categoryCounts: Record<string, number> = {};

  // 1) 本地 markdown 文章：仅当 posts 目录存在时读取，目录缺失不影响外链条目
  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));

      fileNames.forEach(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);

        const postTags = data.tags && Array.isArray(data.tags) ? data.tags : [];
        const postCategory = data.category || '文献阅读';

        categoryCounts[postCategory] = (categoryCounts[postCategory] || 0) + 1;

        posts.push({
          slug,
          title: data.title || '无标题',
          date: data.date || '1970-01-01',
          description: data.description || '',
          tags: postTags,
          category: postCategory,
          cover: data.cover || siteConfig.defaultPostCover,
        });
      });
    }
  } catch (e) {
    console.error("读取文章列表失败", e);
  }

  // 2) 外链作品节点（在线简历、AI 科普站）：无条件收录，不依赖 posts 目录是否存在
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  featuredLinks.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    posts.push({
      slug: `ext-${f.id}`,
      title: f.name,
      date: today,
      description: f.description,
      tags: f.tags,
      category: f.category,
      cover: f.coverImage || '',
      external: true,
      url: f.url,
      icon: f.icon,
      kind: f.kind,
    });
  });

  // 3) 统一按日期倒序排列
  posts.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return dateDiff !== 0 ? dateDiff : b.slug.localeCompare(a.slug);
  });

  const categoriesArray = Object.keys(categoryCounts)
    .map(name => ({ name, count: categoryCounts[name] }))
    .sort((a, b) => b.count - a.count);

  return (
    // 🌟 2. 在最外层用 ToastProvider 包裹整个页面
    <ToastProvider>
      <div className="min-h-screen relative pb-32">
        <Navbar />
        <PageTransition>
          <TimelineClient posts={posts} categories={categoriesArray} />
        </PageTransition>
      </div>
    </ToastProvider>
  );
}