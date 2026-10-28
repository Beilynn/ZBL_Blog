// 追加一张项目矩阵卡片到 data/projects.ts（开源项目 / 学习资料 / 工具导航）
// 用法：npm run new:project
const fs = require('fs');
const path = require('path');
const { createRL, ask, askRequired, askTags, tsStr } = require('./lib/ask');

const root = path.join(__dirname, '..');
const file = path.join(root, 'data', 'projects.ts');

(async () => {
  const rl = createRL();
  console.log('===== 新增项目矩阵卡片 =====');

  const id = await askRequired(rl, '唯一 id（英文短标识，如 my-tool）');
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(`id: '${tsStr(id)}'`)) {
    console.log('该 id 已存在，为避免重复已退出。');
    rl.close();
    process.exit(1);
  }

  const name = await askRequired(rl, '名称 name');
  const description = await askRequired(rl, '介绍 description（一两句，不要换行）');
  const icon = await ask(rl, '图标 emoji（可留空）', '🔗');
  const url = await askRequired(rl, '跳转链接 url（完整 https 地址）');
  const kind = await ask(rl, '类型 kind（github 仓库 / link 普通外链）', 'link');
  const tags = await askTags(rl, '标签 tags（逗号分隔，如 开源项目,RAG）');

  const lines = [
    `  {`,
    `    id: '${tsStr(id)}',`,
    `    name: '${tsStr(name)}',`,
    `    description: '${tsStr(description)}',`,
    `    icon: '${tsStr(icon)}',`,
    `    url: '${tsStr(url)}',`,
    `    kind: '${kind === 'github' ? 'github' : 'link'}',`,
    `    tags: [${tags.map((t) => `'${tsStr(t)}'`).join(', ')}],`,
    `  },`,
  ];

  const idx = text.lastIndexOf('];');
  if (idx < 0) {
    console.log('未找到数组结尾 ];，请检查 data/projects.ts。');
    rl.close();
    process.exit(1);
  }
  const next = text.slice(0, idx) + '\n' + lines.join('\n') + '\n' + text.slice(idx);
  fs.writeFileSync(file, next, 'utf8');

  console.log('已追加到 data/projects.ts');
  console.log('下一步：本地 npm run dev 预览 /projects，确认无误后 Git Bash 执行');
  console.log('  git add . && git commit -m "新增一张项目卡片" && git push origin main');
  rl.close();
})().catch((e) => { console.error(e); process.exit(1); });
