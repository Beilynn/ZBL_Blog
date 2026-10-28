// 本机写作台写盘服务（仅开发环境运行，绝不部署到 Netlify）
// 作用：浏览器 /editor 页面把文章「存草稿」写入 drafts/，「正式发布」写入 posts/
// 启动：npm run editor:server （或随 npm run editor 由 dev-editor.js 一起启动）
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.EDITOR_PORT || 4100);
const ROOT = path.join(__dirname, '..');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS });
  res.end(body);
}

function pad(n) { return String(n).padStart(2, '0'); }
function todayPart() {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}
function defaultNow() { return `${todayPart()} 10:00:00`; }

// 文件名安全：只保留 basename，禁止目录穿越
function safeName(file) { return path.basename(String(file || '')); }

// slug 清洗：小写、非字母数字连字符下划线替换为 -
function sanitizeSlug(slug) {
  return String(slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// YAML 单引号字符串：内部单引号双写转义
function yq(s) {
  return "'" + String(s == null ? '' : s).replace(/'/g, "''") + "'";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 2 * 1024 * 1024) { reject(new Error('body too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// 生活说说 frontmatter：对齐 app/moments/page.tsx 读取契约（date/location/images + 纯文本正文）
function buildMomentFrontmatter(d) {
  const images = Array.isArray(d.images)
    ? d.images.map((u) => String(u).trim()).filter(Boolean)
    : [];
  const imageBlock = images.length
    ? images.map((u) => `- ${u}`).join('\n')
    : '[]';
  const tags = Array.isArray(d.tags)
    ? d.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];
  const tagBlock = tags.length
    ? tags.map((t) => `- ${t}`).join('\n')
    : '[]';
  return [
    '---',
    `date: ${yq(d.date)}`,
    `location: ${yq(d.location || '')}`,
    'images:',
    imageBlock,
    'tags:',
    tagBlock,
    '---',
    '',
  ].join('\n');
}

// 说说直接写入 moments/（无草稿、无 slug、无详情页），文件名按时间避免冲突
function handleSaveMoment(res, body) {
  const text = String(body.body || '').trim();
  if (!text) return sendJson(res, 400, { ok: false, error: '说说正文不能为空' });

  const dateRaw = String(body.date || '').trim() || defaultNow();
  const datePart = dateRaw.slice(0, 10) || todayPart();
  const hhmm = (dateRaw.slice(11, 15) || '0000').replace(/[^\d]/g, '') || '0000';

  const dir = path.join(ROOT, 'moments');
  fs.mkdirSync(dir, { recursive: true });

  let fileName = `${datePart}-${hhmm}.md`;
  let filePath = path.join(dir, fileName);
  let suffix = 2;
  while (fs.existsSync(filePath)) {
    fileName = `${datePart}-${hhmm}-${suffix}.md`;
    filePath = path.join(dir, fileName);
    suffix += 1;
  }

  const content = buildMomentFrontmatter({ ...body, date: dateRaw }) + text + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  sendJson(res, 200, { ok: true, kind: 'moment', file: fileName, dir: 'moments', relative: `moments/${fileName}` });
}

// 构造与 scripts/new-article.js 完全一致的 frontmatter 字段契约
function buildFrontmatter(d) {
  const tags = Array.isArray(d.tags) ? d.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  const tagLines = tags.length ? tags.map((t) => `- ${t}`).join('\n') : '- 未分类';
  const coverLine = d.cover ? `cover: ${yq(d.cover)}` : "cover: ''";
  return [
    '---',
    `title: ${yq(d.title)}`,
    `date: ${yq(d.date)}`,
    `category: ${yq(d.category || '文献阅读')}`,
    'tags:',
    tagLines,
    `description: ${yq(d.description)}`,
    coverLine,
    '---',
    '',
  ].join('\n');
}

async function handleSave(req, res) {
  let body;
  try { body = await readBody(req); }
  catch { return sendJson(res, 400, { ok: false, error: '请求体不是合法 JSON' }); }

  const kind = body.kind === 'moment' ? 'moment' : 'article';
  if (kind === 'moment') return handleSaveMoment(res, body);

  const mode = body.mode === 'draft' ? 'draft' : 'publish';
  if (!body.title || !String(body.title).trim()) {
    return sendJson(res, 400, { ok: false, error: '标题不能为空' });
  }

  const dateRaw = String(body.date || '').trim() || defaultNow();
  const datePart = dateRaw.slice(0, 10) || todayPart();
  const slug = sanitizeSlug(body.slug) || `post-${Date.now().toString(36)}`;
  const dirName = mode === 'draft' ? 'drafts' : 'posts';
  const dir = path.join(ROOT, dirName);
  fs.mkdirSync(dir, { recursive: true });

  const fileName = `${datePart}-${slug}.md`;
  const filePath = path.join(dir, fileName);
  if (fs.existsSync(filePath) && !body.overwrite) {
    return sendJson(res, 409, { ok: false, error: '文件已存在，可修改 slug 后重试', exists: fileName, dir: dirName });
  }

  const content = buildFrontmatter({ ...body, date: dateRaw }) + String(body.body || '').replace(/^\n+/, '') + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  sendJson(res, 200, { ok: true, mode, file: fileName, dir: dirName, relative: `${dirName}/${fileName}` });
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const fm = m[1];
  const body = m[2];
  const get = (k) => {
    const r = new RegExp('^' + k + ":\\s*'?(.+?)'?\\s*$", 'm');
    const mm = fm.match(r);
    return mm ? mm[1] : '';
  };
  // 逐行收集指定 key 的 YAML 列表项（tags / images），直到下一个 key 行
  const collectList = (key) => {
    const out = [];
    let active = false;
    for (const line of fm.split('\n')) {
      if (new RegExp('^' + key + ":\\s*$").test(line)) { active = true; continue; }
      if (active) {
        const tm = line.match(/^-\s+(.*)$/);
        if (tm) { out.push(tm[1].trim()); continue; }
        active = false;
      }
    }
    return out;
  };
  return {
    meta: {
      title: get('title'), date: get('date'), category: get('category'),
      description: get('description'), cover: get('cover'), tags: collectList('tags'),
      location: get('location'), images: collectList('images'),
    },
    body,
  };
}

function listFiles(dirName) {
  if (!['drafts', 'posts', 'moments'].includes(dirName)) return [];
  const dir = path.join(ROOT, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { meta } = parseFrontmatter(raw);
      return { file: f, title: meta.title || f, date: meta.date || '', dir: dirName };
    });
}

async function handleRead(req, res, url) {
  const dirName = url.searchParams.get('dir') === 'drafts' ? 'drafts' : 'posts';
  const file = safeName(url.searchParams.get('file'));
  const fp = path.join(ROOT, dirName, file);
  if (!file || !fs.existsSync(fp)) return sendJson(res, 404, { ok: false, error: '文件不存在' });
  const { meta, body } = parseFrontmatter(fs.readFileSync(fp, 'utf8'));
  sendJson(res, 200, { ok: true, meta, body, file, dir: dirName });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return sendJson(res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/api/list') {
      return sendJson(res, 200, { ok: true, drafts: listFiles('drafts'), posts: listFiles('posts'), moments: listFiles('moments') });
    }
    if (req.method === 'GET' && url.pathname === '/api/read') return await handleRead(req, res, url);
    if (req.method === 'POST' && url.pathname === '/api/save') return await handleSave(req, res);
    sendJson(res, 404, { ok: false, error: 'not found' });
  } catch (e) {
    sendJson(res, 500, { ok: false, error: e.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[editor-server] 写盘服务已启动: http://127.0.0.1:${PORT} （仅本机开发使用，勿部署）`);
});
