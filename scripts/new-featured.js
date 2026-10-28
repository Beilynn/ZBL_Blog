// 追加一条归档外链作品到 data/featured.ts（个人简历 / 文献阅读 / 项目站等）
// 用法：npm run new:featured
const fs = require('fs');
const path = require('path');
const { createRL, ask, askRequired, askTags, tsStr } = require('./lib/ask');

const root = path.join(__dirname, '..');
const file = path.join(root, 'data', 'featured.ts');

(async () => {
  const rl = createRL();
  console.log('===== 新增归档外链作品 =====');

  const id = await askRequired(rl, '唯一 id（英文短标识，如 resume、ai-tool）');
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(`id: '${tsStr(id)}'`)) {
    console.log('该 id 已存在，为避免重复已退出。');
    rl.close();
    process.exit(1);
  }

  const name = await askRequired(rl, '名称 name');
  const description = await askRequired(rl, '介绍 description（一两句，不要换行）');
  const icon = await ask(rl, '图标 emoji（可留空）', '🔗');
  const category = await ask(rl, '归档大类 category（个人简历 / 文献阅读 / 项目）', '项目');
  const tags = await askTags(rl, '要点小标签 tags（逗号分隔，如 循证科普,AI 工具）');
  const url = await askRequired(rl, '跳转链接 url（完整 https 地址）');
  const kind = await ask(rl, '类型 kind（link 普通外链 / github 仓库）', 'link');
  const cover = await ask(rl, '封面图路径 coverImage（public 相对路径，如 /works/xx.png，可留空）', '');

  const lines = [
    `  {`,
    `    id: '${tsStr(id)}',`,
    `    name: '${tsStr(name)}',`,
    `    description: '${tsStr(description)}',`,
    `    icon: '${tsStr(icon)}',`,
  ];
  if (cover) lines.push(`    coverImage: '${tsStr(cover)}',`);
  lines.push(
    `    category: '${tsStr(category)}',`,
    `    tags: [${tags.map((t) => `'${tsStr(t)}'`).join(', ')}],`,
    `    url: '${tsStr(url)}',`,
    `    kind: '${kind === 'github' ? 'github' : 'link'}',`,
    `  },`,
  );

  const idx = text.lastIndexOf('];');
  if (idx < 0) {
    console.log('未找到数组结尾 ];，请检查 data/featured.ts。');
    rl.close();
    process.exit(1);
  }
  const next = text.slice(0, idx) + '\n' + lines.join('\n') + '\n' + text.slice(idx);
  fs.writeFileSync(file, next, 'utf8');

  console.log('已追加到 data/featured.ts');
  console.log('下一步：本地 npm run dev 预览 /timeline，确认无误后 Git Bash 执行');
  console.log('  git add . && git commit -m "新增一条归档外链" && git push origin main');
  rl.close();
})().catch((e) => { console.error(e); process.exit(1); });
