// 新增归档时间线文章：在 posts/ 目录生成 Markdown
// 出现在 /timeline 时间线，点击卡片进入站内详情页 /posts/<slug>
// 用法：npm run new:article
const fs = require('fs');
const path = require('path');
const { createRL, ask, askRequired, askTags, tsStr } = require('./lib/ask');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'posts');

function pad(n) { return String(n).padStart(2, '0'); }

(async () => {
  const rl = createRL();
  console.log('===== 新增归档时间线文章（/timeline → /posts/slug）=====');

  const title = await askRequired(rl, '文章标题 title');
  const rawSlug = await ask(rl, '英文短标识 slug（用于网址 /posts/slug，留空自动生成）', '');
  const slug = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || `post-${Date.now().toString(36)}`;

  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const date = await ask(rl, '写作时间 date（格式 YYYY-MM-DD HH:mm:ss）', `${today} 10:00:00`);

  const category = await ask(rl, '归档大类 category（个人简历 / 文献阅读 / 项目，顶部筛选栏使用）', '文献阅读');
  const tags = await askTags(rl, '标签 tags（逗号分隔，如 心理学,实验设计）');
  const description = await ask(rl, '卡片摘要 description（时间线卡片上的两句简介，可留空）', '');
  const cover = await ask(rl, '封面图 cover（public 路径如 /works/x.png 或外链 URL，留空用默认封面）', '');

  const datePart = date.slice(0, 10);
  const fileName = `${datePart}-${slug}.md`;
  const filePath = path.join(dir, fileName);

  if (fs.existsSync(filePath)) {
    console.log('文件已存在，为避免覆盖已退出：', path.relative(root, filePath));
    rl.close();
    process.exit(1);
  }

  fs.mkdirSync(dir, { recursive: true });
  const tagLines = tags.length ? tags.map((t) => `- ${t}`).join('\n') : '- 未分类';
  const coverLine = cover ? `cover: '${tsStr(cover)}'` : "cover: ''";

  const content = [
    '---',
    `title: '${tsStr(title)}'`,
    `date: '${date}'`,
    `category: '${tsStr(category)}'`,
    'tags:',
    tagLines,
    `description: '${tsStr(description)}'`,
    coverLine,
    '---',
    '',
    '## 一、小标题',
    '',
    '在这里写正文，支持 Markdown：加粗 **、引用 >、列表 -、代码块 ```、数学公式（KaTeX）等。',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('已生成：', path.relative(root, filePath));
  console.log('下一步：打开该文件补写正文；npm run dev 预览 /timeline 与 /posts/' + slug);
  console.log('  git add . && git commit -m "新增一篇归档文章" && git push origin main');
  rl.close();
})().catch((e) => { console.error(e); process.exit(1); });
