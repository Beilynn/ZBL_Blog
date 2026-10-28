// 内容发布主菜单：npm run new
// 选择编号后启动对应的子脚本，填写完成再统一 git 推送
const { spawnSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const items = [
  ['新增归档时间线文章（posts/*.md，出现在 /timeline，可点开详情）', 'new-article.js'],
  ['新增归档外链作品（data/featured.ts）', 'new-featured.js'],
  ['新增项目矩阵卡片（data/projects.ts）', 'new-project.js'],
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log('===== Beilynn Blog 内容发布助手 =====');
items.forEach((it, i) => console.log(`${i + 1}) ${it[0]}`));

rl.question('请输入编号后回车：', (ans) => {
  const i = parseInt(String(ans).trim(), 10) - 1;
  rl.close();
  if (!items[i]) {
    console.log('编号无效，已退出。');
    process.exit(1);
  }
  spawnSync(process.execPath, [path.join(__dirname, items[i][1])], { stdio: 'inherit' });
});
