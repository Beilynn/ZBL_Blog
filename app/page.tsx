import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import SearchBar from '../components/SearchBar';
import { siteConfig } from '../siteConfig';
import CloudPlayer from '../components/CloudPlayer';
import WeatherWidget from '../components/WeatherWidget';
import ClockCalendarWidget from '../components/ClockCalendarWidget';
import WhackAMoleWidget from '../components/WhackAMoleWidget';
import ContactLinks from '../components/ContactLinks';
import PsyNews from '../components/PsyNews';
import { albums } from '../data/albums';
import { ToastProvider } from '../components/ToastProvider';

function formatUpdateTime(dateString: string) {
  if (!dateString || dateString === '1970-01-01') return '刚刚更新';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch { return dateString; }
}

export default function Home() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let allPosts: any[] = [];
  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));
      allPosts = fileNames.map(fileName => {
        const fullPath = path.join(postsDirectory, fileName);
        const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));
        const rawDate = data.date || '1970-01-01';
        return {
          slug: fileName.replace(/\.md$/, ''),
          ...data,
          title: data.title || '',
          description: data.description || '',
          content: content || '',
          date: rawDate,
          formattedDate: formatUpdateTime(rawDate)
        };
      }).sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return b.slug.localeCompare(a.slug);
      });
    }
  } catch (e) {}

  const chattersDirectory = path.join(process.cwd(), 'chatters');
  let allChatters: any[] = [];
  try {
    if (fs.existsSync(chattersDirectory)) {
      const chatterFiles = fs.readdirSync(chattersDirectory).filter(f => f.endsWith('.md'));
      allChatters = chatterFiles.map(fileName => {
        const fullPath = path.join(chattersDirectory, fileName);
        const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
        return { slug: fileName.replace(/\.md$/) };
      });
    }
  } catch (e) {}

  const chatterCount = allChatters.length;
  const realPhotoCount = albums.reduce((total, album) => total + album.photos.length, 0);

  const navItems = [
    { label: '归档', href: '/timeline', icon: '🗂️' },
    { label: '说说', href: '/moments', icon: '💬' },
    { label: '照片墙', href: '/photowall', icon: '🖼️' },
    { label: '项目', href: '/projects', icon: '💻' },
    { label: '关于', href: '/about', icon: 'ℹ️' },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen relative bg-[#f5ebe0]">
        <Navbar />
        <PageTransition>
          {/* 顶部 Hero 区域：背景图完整显示 */}
          <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${siteConfig.bgImages[0]}')` }}
            ></div>
            {/* 渐变过渡到下面的背景 */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-[#f5ebe0]/50 to-[#f5ebe0]"></div>
            {/* 居中标题 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-4 tracking-wide">
                Never Say Never
              </h1>
              <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
                穷则独善其身，达则兼善天下
              </p>
            </div>
          </div>

          {/* 下面内容区域 */}
          <div className="relative z-10 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl mx-auto">
              {/* 搜索框居中 */}
              <div className="mb-8 -mt-20 relative z-20">
                <SearchBar posts={allPosts} />
              </div>

              {/* 三列布局 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                
                {/* 左列：头像卡片 + 导航 + 小部件 */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
                  {/* 紧凑的头像卡片 - 米色背景 */}
                  <div className="bg-[#fdf6ec]/90 backdrop-blur-md rounded-3xl p-6 shadow-lg flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 ring-4 ring-yellow-400/50">
                      <img src={siteConfig.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{siteConfig.authorName}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      生活明朗，万物可爱。
                    </p>
                    {/* 统计数据 */}
                    <div className="flex justify-center gap-6 w-full mt-2 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-500">{allPosts.length}</div>
                        <div className="text-xs text-slate-500">文章</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-500">{chatterCount}</div>
                        <div className="text-xs text-slate-500">说说</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-500">{realPhotoCount}</div>
                        <div className="text-xs text-slate-500">照片</div>
                      </div>
                    </div>
                    {/* 联系方式 */}
                    <ContactLinks/>
                    <a
                      href="https://beilynn.github.io/Resume/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold py-2.5 shadow-md shadow-orange-200/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span aria-hidden="true">📄</span>
                      查看我的简历
                      <span aria-hidden="true" className="text-xs">↗</span>
                    </a>
                  </div>
                  
                  {/* 导航卡片 */}
                  <div className="bg-[#fdf6ec]/90 backdrop-blur-md rounded-3xl p-6 shadow-lg">
                    <h3 className="font-bold text-slate-700 mb-4">导航</h3>
                    <div className="flex flex-col gap-3">
                      {navItems.map((item) => (
                        <Link 
                          key={item.href} 
                          href={item.href}
                          className="flex items-center gap-3 text-slate-600 hover:text-orange-500 transition-colors"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* 天气卡片 - 左下 */}
                  <WeatherWidget/>
                </div>

                {/* 中列：心理学动态 + 本地文章 */}
                <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
                  <PsyNews />
                  {allPosts.slice(0, 6).map((post) => (
                    <Link 
                      key={post.slug} 
                      href={`/posts/${post.slug}`}
                      className="bg-[#fdf6ec]/90 backdrop-blur-md rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex gap-5"
                    >
                      <div className="w-36 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={post.cover || siteConfig.defaultPostCover} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-1">{post.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{post.formattedDate}</span>
                          {post.tags && post.tags[0] && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                              {post.tags[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* 右列：音乐 + 时间 + 日历 + 打地鼠 */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
                  <CloudPlayer/>
                  <ClockCalendarWidget/>
                  <WhackAMoleWidget/>
                </div>

              </div>
            </div>
          </div>
        </PageTransition>
      </div>
    </ToastProvider>
  );
}
