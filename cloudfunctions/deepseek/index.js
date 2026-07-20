/**
 * 云函数：deepseek —— 中转调用 DeepSeek 大模型生成拼贴诗
 *
 * 【重要】DeepSeek API Key 通过云开发环境变量注入，绝不写死在代码里。
 * 部署前请在云开发控制台给本云函数配置环境变量：DEEPSEEK_API_KEY
 * （微信开发者工具 → 云开发 → 云函数 → deepseek → 配置 → 环境变量）
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// DeepSeek 兼容 OpenAI 格式的接口
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'

// 拼贴诗 prompt：让 DeepSeek 把日记改造成破碎、荒诞、有"人机感"的意象碎片
const SYSTEM_PROMPT = `你是一位擅长"拼贴诗/found poem"的诗人，风格破碎、荒诞、反秩序、带一点冰冷的人机感。
用户会给你一篇潦草的日记（标题+正文）。请你：
1. 理解其中的情绪，把它改造重组成一首破碎的拼贴诗；
2. 把这首诗拆解成 10-18 个"碎片"，每个碎片 2-8 个字，风格混搭（有的文艺、有的日常、有的荒诞、有的像报纸剪下来的词）；
3. 碎片之间可以断裂、跳跃、不连贯，这正是拼贴诗的美感。
只输出一个 JSON，格式为：{"fragments": ["碎片1", "碎片2", ...]}
不要输出任何解释、markdown 代码块标记或多余文字。`

exports.main = async (event) => {
  const { title = '', content = '' } = event
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return { error: '未配置 DEEPSEEK_API_KEY 环境变量，请在云开发控制台为 deepseek 云函数配置。' }
  }
  if (!content && !title) {
    return { error: '标题和正文不能都为空' }
  }

  const userMsg = `标题：${title}\n正文：${content}`

  try {
    // 云函数运行时（Node）用全局 fetch（Node18+）；低版本可换 axios
    const resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg }
        ],
        temperature: 1.3,
        max_tokens: 800
      })
    })

    const data = await resp.json()
    const text = data?.choices?.[0]?.message?.content || ''

    // 尝试解析 JSON
    let fragments = []
    try {
      const cleaned = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      fragments = parsed.fragments || []
    } catch (e) {
      // 解析失败兜底：按标点粗切
      fragments = text
        .split(/[\n\r，。！？、；：,.!?;:\s]+/)
        .map(s => s.trim())
        .filter(Boolean)
    }

    return { fragments, raw: text }
  } catch (err) {
    return { error: 'DeepSeek 调用失败：' + (err.message || String(err)) }
  }
}
