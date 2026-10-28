// 通用命令行问答工具：三个发布脚本共用（零第三方依赖）
const readline = require('readline');

function createRL() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

// 普通提问：直接回车则使用默认值
function ask(rl, text, def = '') {
  const suffix = def ? ` [默认: ${def}]` : '';
  return new Promise((resolve) => {
    rl.question(`${text}${suffix}: `, (line) => {
      const v = String(line || '').trim();
      resolve(v === '' ? def : v);
    });
  });
}

// 必填提问：留空就一直问到输入为止
async function askRequired(rl, text) {
  for (;;) {
    const v = await ask(rl, text);
    if (v) return v;
    console.log('  该项不能为空，请重新输入。');
  }
}

// 标签：逗号、顿号、空格都可以分隔
async function askTags(rl, text) {
  const raw = await ask(rl, text);
  return raw.split(/[,，、\s]+/).filter(Boolean);
}

// 转成 TypeScript 单引号字符串：折叠换行、转义单引号
function tsStr(s) {
  return String(s == null ? '' : s)
    .replace(/\s+/g, ' ')
    .replace(/'/g, "\\'")
    .trim();
}

module.exports = { createRL, ask, askRequired, askTags, tsStr };
