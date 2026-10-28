// app/api/chat/route.ts
// 小猫「煤球」聊天服务端转发：密钥只从本机环境变量读取，不写进源码、不提交仓库、不下发到浏览器
import { siteConfig } from '../../../siteConfig';

export const runtime = 'nodejs';

// 接口地址与模型可用环境变量覆盖，默认走校内 DeepSeek 兼容网关
const API_BASE = process.env.CHAT_API_BASE || 'https://token.nbu.edu.cn/v1/chat/completions';
const MODEL = process.env.CHAT_MODEL || 'deepseek-v4-flash';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiKey = (process.env.CHAT_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim();
    if (!apiKey) {
      // 线上无本机密钥时直接返回错误，前端小猫会用兜底话术，不会暴露任何 key
      return new Response(JSON.stringify({ error: 'Key missing' }), { status: 500 });
    }

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: siteConfig.geminiConfig.systemPrompt },
          { role: 'user', content: String(message || '') },
        ],
        enable_thinking: false,
        max_tokens: siteConfig.geminiConfig.maxOutputTokens,
        temperature: siteConfig.geminiConfig.temperature,
      }),
    });

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `模型拒绝访问: ${response.status}`,
        details: data?.error?.message || data?.message || '未知错误',
      }), { status: response.status });
    }

    const reply = data?.choices?.[0]?.message?.content || '本喵现在不想理你喵...';
    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || '服务异常' }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: 'Ready', model: MODEL }), { status: 200 });
}
