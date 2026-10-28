# 本地内容发布脚本

零第三方依赖，只用 Node 内置模块。在项目根目录（含 `package.json` 的目录）运行。

## 命令一览

| 命令 | 作用 | 写入位置 | 展示位置 |
| --- | --- | --- | --- |
| `npm run editor` | 可视化写作台（同时启动站点 + 本机写盘服务） | 见「可视化写作台」 | `/editor` |
| `npm run editor:server` | 仅单独启动写盘服务（站点已在跑时用） | — | — |
| `npm run new` | 交互菜单，选编号 1/2/3 | 见下 | — |
| `npm run new:article` | 命令行方式新增归档时间线文章（带正文详情页） | `posts/日期-slug.md` | `/timeline` + `/posts/slug` |
| `npm run new:featured` | 新增归档外链作品（在线简历、AI 工具站等） | `data/featured.ts` | `/timeline` |
| `npm run new:project` | 新增项目矩阵卡片（开源项目、学习资料） | `data/projects.ts` | `/projects` |
| `npm run save` | 日常本地保存：add + commit，**不推送** | 本地 git | GitHub 不可见 |
| `npm run publish` | 上线发布：合并本地多条提交为一条后 push | 推送到 `main` | Netlify 自动构建 |

## Git 提交与上线流程（两者结合）

- **`npm run save`（日常用）**：写完内容、改完样式随时跑一次，改动只进本地 git 历史，不会推到 GitHub，也不会触发 Netlify 构建。提交信息自动写成 `update: 日期 时间`，不用每次手写句子。
- **`npm run publish`（要上线时用）**：先把本地攒下的多条提交合并（squash）成一条，再 `git push origin main`，GitHub 历史里只看到一条干净记录，随后 Netlify 自动部署。
- 顺序建议：本地反复 `npm run save` 保存 → `npm run dev` 确认效果 → 满意后 `npm run publish` 上线。
- 若 `publish` 提示远程领先，先 `git pull --rebase origin main` 再发布；推送失败多为网络问题，直接重试即可，本地改动不会丢失。

## 0. 可视化写作台（推荐日常写作）

`npm run editor` 会同时启动 Next 开发服务器和本机写盘服务，浏览器打开 `/editor`，顶部可在「归档文章 / 生活说说」之间切换。

**归档文章模式**

- 左侧写 Markdown、右侧实时预览，顶部工具栏一键插入标题、加粗、引用、列表、代码块、链接、图片、分割线。
- 右侧面板填写大类、写作时间、slug、标签胶囊、卡片摘要、封面图。
- **存为草稿**：写入 `drafts/`（已被 `.gitignore` 忽略，不进入时间线、不提交），草稿箱可随时点开继续编辑。
- **正式发布**：写入 `posts/日期-slug.md`，进入 `/timeline` 时间线并生成 `/posts/slug` 详情页。

**生活说说模式**

- 纯文本正文（支持换行，无需 Markdown），可填定位、标签（回车添加，可留空）、配图 URL（每行一张，可留空）。
- **保存说说**：直接写入 `moments/日期-时分.md`，刷新 `/moments` 生活动态即可看到；标签以胶囊形式显示在正文下方，搜索时可按标签检索；说说无草稿、无详情页，随写随存。

- 导航栏「写作台」入口仅本地开发环境显示，线上自动隐藏。
- 日常用 `npm run save` 本地保存，确认无误后 `npm run publish` 合并并推送上线；草稿无需提交。

## 1. 归档时间线文章（`npm run new:article`）

这是写进 `/timeline` 时间线的正文文章：时间线卡片按日期倒序排列，点击进入站内详情页阅读完整正文。

按提示填写，回车可用默认值：

- `title` 文章标题（必填）
- `slug` 英文短标识，用于详情网址 `/posts/slug`，留空自动生成
- `date` 写作时间，格式 `YYYY-MM-DD HH:mm:ss`，默认今天 10:00:00
- `category` 归档大类（顶部筛选栏使用）：`个人简历` / `文献阅读` / `项目`，默认「文献阅读」
- `tags` 标签，逗号分隔，如 `心理学,实验设计`
- `description` 卡片摘要，时间线卡片上显示的两句简介，可留空
- `cover` 封面图：填 `public` 相对路径（如 `/works/x.png`）或外链 URL；留空使用站点默认封面

生成后打开 `.md` 文件，在 `---` 分隔线下方补写正文（支持 Markdown、代码高亮、KaTeX 公式、标题目录）。

## 2. 归档外链作品（`npm run new:featured`）

出现在 `/timeline`，点击新标签打开外部链接：

- `id` 唯一英文标识（必填，重复会拒绝写入）
- `name` 名称（必填）
- `description` 一两句介绍，不要换行（必填）
- `icon` 图标 emoji，可留空
- `category` 大类：`个人简历` / `文献阅读` / `项目`
- `tags` 要点小标签，逗号分隔（卡片下方胶囊展示，不参与筛选）
- `url` 完整 https 链接（必填）
- `kind`：`link` 普通外链 / `github` 仓库
- `coverImage` 封面图路径，先把图片放到 `public/works/`，再填如 `/works/xx.png`，可留空

## 3. 项目矩阵卡片（`npm run new:project`）

出现在 `/projects`：

- `id` 唯一英文标识（必填，查重）
- `name` 名称（必填）
- `description` 一两句介绍，不要换行（必填）
- `icon` 图标 emoji
- `url` 完整 https 链接（必填）
- `kind`：`github` / `link`
- `tags` 标签，逗号分隔

## 本地预览与上线

推荐一键流程（自动合并提交历史）：

```bash
npm run dev          # 本地预览，确认页面显示正常
npm run save         # 日常本地保存（不推送、不触发部署），可多次执行
npm run publish      # 合并本地提交并推送到 main，Netlify 自动构建上线
```

也可以手动执行等价命令：

```bash
git add .
git commit -m "update"
git push origin main
```

## 注意事项

- 已存在的同名 `.md` 不会被覆盖；重复 `id` 会拒绝写入，避免脏数据。
- 时间线文章封面图可放 `public/works/` 或使用外链 URL。
- `npm run editor` 可视化写作台与 `npm run new:article` 命令行脚本二选一即可，产出的是同格式 `posts/*.md`。
- 草稿 `drafts/` 已被 git 忽略，仅本机保存，不会随仓库上线。
- 内容区分：`posts/` 是带详情页的归档文章；`chatters/` 是短杂谈、`moments/` 是说说，这两类可直接手写同名 `.md`，需要时再补对应脚本。
- 照片墙增图仍使用 PowerShell 脚本 `.\generate-albums.ps1` 重新扫描 `public/photos`；友链维护 `data/friends.ts`。
