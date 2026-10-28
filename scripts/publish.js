// 一键 Git 提交脚本（零依赖，在 Git Bash 或终端运行）
//   npm run save      日常本地保存：add + commit，不推送（GitHub 上看不到）
//   npm run publish   上线发布：先把本地多条提交合并成一条，再 push 到 GitHub，Netlify 自动构建
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// 优先用 PATH 里的 git；找不到时回退到常见安装路径
const FALLBACK_GIT = 'D:\\Git\\Git\\bin\\git.exe';

function run(args) {
  let r = spawnSync('git', args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] });
  if (r.error && r.error.code === 'ENOENT') {
    r = spawnSync(FALLBACK_GIT, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] });
  }
  return r;
}
const ok = (r) => r.status === 0;

function dirtyLines() {
  const r = run(['status', '--porcelain']);
  return ok(r) ? r.stdout.toString().trim() : '';
}
function aheadCount() {
  const r = run(['rev-list', '--count', 'origin/main..HEAD']);
  return ok(r) ? (parseInt(r.stdout.toString().trim(), 10) || 0) : 0;
}
function stamp() {
  const n = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
}

const mode = process.argv[2];

// 日常本地保存：只提交，不推送
if (mode === 'save') {
  if (!dirtyLines()) {
    console.log('没有改动需要保存。');
    process.exit(0);
  }
  run(['add', '.']);
  const c = run(['commit', '-m', `update: ${stamp()}`]);
  if (ok(c)) {
    console.log('已本地保存（未推送）。确认满意后运行 npm run publish 上线。');
    process.exit(0);
  }
  console.log('提交失败，请查看上方 git 输出。');
  process.exit(1);
}

// 上线发布：合并本地提交为一条后推送
if (mode === 'publish') {
  // 先同步远程引用，失败不阻断（首次推送时也允许继续）
  run(['fetch', 'origin', 'main']);

  // 若远程有本地没有的提交，先提示拉取，避免合并时覆盖
  const behindRaw = run(['rev-list', '--count', 'HEAD..origin/main']).stdout.toString().trim();
  const behind = parseInt(behindRaw || '0', 10);
  if (behind > 0) {
    console.log(`远程 main 领先本地 ${behind} 条提交，请先 git pull --rebase origin main 再发布。`);
    process.exit(1);
  }

  const dirty = dirtyLines();
  const ahead = aheadCount();
  if (!dirty && ahead === 0) {
    console.log('没有待发布的改动。');
    process.exit(0);
  }

  // 1. 先把尚未提交的改动收进一条提交
  if (dirty) {
    run(['add', '.']);
    const c = run(['commit', '-m', `update: ${stamp()}`]);
    if (!ok(c)) { console.log('提交失败，请查看上方 git 输出。'); process.exit(1); }
  }

  // 2. 把本地领先远程的多条提交合并成一条（文件内容不变，仅压缩提交历史）
  const ahead2 = aheadCount();
  if (ahead2 > 1) {
    run(['reset', '--soft', 'origin/main']);
    const c = run(['commit', '-m', `update: ${stamp()}`]);
    if (!ok(c)) { console.log('合并提交失败，请查看上方 git 输出。'); process.exit(1); }
    console.log(`已将 ${ahead2} 条本地提交合并为 1 条。`);
  }

  // 3. 推送
  const push = run(['push', 'origin', 'main']);
  if (ok(push)) {
    console.log('已推送到 GitHub，Netlify 将自动构建上线。');
    process.exit(0);
  }
  console.log('推送失败：多为网络问题，直接重试 npm run publish 即可；必要时确认代理 127.0.0.1:7897。本地改动不会丢失。');
  process.exit(1);
}

console.log('用法：npm run save（本地保存，不推送） / npm run publish（合并本地提交并推送上线）');
