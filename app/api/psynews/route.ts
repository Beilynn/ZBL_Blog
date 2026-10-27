import { NextResponse } from 'next/server'

// 数据源：PsyHOT 公开 RSS（最新 50 条精选摘要）
const RSS_URL = 'https://psyhot.cn/rss.xml'
const CACHE_TTL = 10 * 60 * 1000 // 服务端缓存 10 分钟，跟随更新同时减轻对方站点压力
const MAX_ITEMS = 8 // 首页最多展示条数

export type PsyNewsItem = {
  id: string
  title: string
  link: string
  summary: string
  source: string
  category: string
  dateText: string
}

// 模块级内存缓存：同一函数实例内 10 分钟内复用结果
let cache: { at: number; data: PsyNewsItem[] } | null = null

// 去掉 HTML 标签和常见实体，得到纯文本摘要
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function formatDate(raw: string): string {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

// 从 RSS 文本中解析出最新的精选条目（不依赖第三方 XML 库，正则拆分 item）
function extractItems(xml: string): PsyNewsItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || []
  const out: PsyNewsItem[] = []

  for (const block of blocks) {
    const title = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || '').trim()
    const link = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '').trim()
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '').trim()
    const category = (block.match(/<category>([\s\S]*?)<\/category>/)?.[1] || '').trim()
    const author = (block.match(/<author>[\s\S]*?\(([\s\S]*?)\)<\/author>/)?.[1] || '').trim()
    const guid = (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || '').trim()

    // description 的第一段 <p> 是研究摘要，后面是原文链接和来源说明，只取第一段
    const descCdata = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || ''
    const firstP = descCdata.match(/<p>([\s\S]*?)<\/p>/)?.[1] || descCdata
    const summary = stripHtml(firstP).slice(0, 110)

    if (!title || !link) continue
    out.push({
      id: guid || link,
      title,
      link,
      summary,
      source: author || 'PsyHOT',
      category,
      dateText: formatDate(pubDate),
    })
  }

  return out.slice(0, MAX_ITEMS)
}

// 每次请求都执行服务端函数，配合上面的内存缓存控制抓取频率
export const dynamic = 'force-dynamic'

export async function GET() {
  const now = Date.now()
  if (cache && now - cache.at < CACHE_TTL) {
    return NextResponse.json({ items: cache.data, cached: true })
  }

  try {
    const res = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BlogNewsFetcher/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`RSS HTTP ${res.status}`)

    const xml = await res.text()
    const items = extractItems(xml)
    cache = { at: now, data: items }
    return NextResponse.json({ items, cached: false })
  } catch (err) {
    console.error('[api/psynews] RSS 抓取失败:', err)
    // 抓取失败时优先返回旧缓存；没有旧缓存则返回空数组，前端显示兜底提示而不是白屏
    const fallback = cache?.data ?? []
    return NextResponse.json({ items: fallback, cached: true, stale: true })
  }
}
