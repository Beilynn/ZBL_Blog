// 一键同时启动：Next 开发服务器 + 本机写盘服务（仅开发环境使用）
// 用法：npm run editor
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

// 直接用 node 运行 next CLI，不经过 npm.cmd/shell：消除 DEP0190 警告并少一层进程
const dev = spawn(process.execPath, [nextBin, 'dev'], { stdio: 'inherit' });
const server = spawn(process.execPath, [path.join(__dirname, 'editor-server.js')], { stdio: 'inherit' });

// Windows 下用 taskkill 连同子进程树一起结束，避免 next dev 残留占用端口
function killTree(c) {
  if (!c || !c.pid || c.killed) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(c.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      c.kill('SIGTERM');
    }
  } catch (_) {}
}

function shutdown() {
  killTree(dev);
  killTree(server);
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

dev.on('exit', () => { killTree(server); process.exit(0); });
server.on('exit', () => { killTree(dev); process.exit(0); });
