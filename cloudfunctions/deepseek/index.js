/**
 * 云函数：deepseek —— 中转调用 DeepSeek 生成「拼贴诗」
 * 输出一首有标题、分行、能读通的诗（lines），前端再把每行切成碎片渲染。
 * DeepSeek API Key 走云开发环境变量 DEEPSEEK_API_KEY，绝不写进代码。
 */
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'

const SYSTEM_PROMPT = `你是一位擅长"拼贴诗/found poem"的诗人。
用户会给你一篇潦草的日记（标题+正文）。请你把它改写重组成一首**拼贴诗**：
1. 先给一个短标题（如"人生是否可以没有苦恼""喜欢拾荒"）；
2. 诗体本身是一首**能读通、情绪连贯的诗**，分行（共 4-8 行，尽量简短）；
3. 风格破碎、敏感、带一点冷的人机感，但**每一行都是可以读的句子**，不是散落的词；
4. 每行可长可短（短则 2-4 字，长则一整句）。
只输出一个 JSON：{"title": "标题", "lines": ["第一行", "第二行", ...]}
不要输出任何解释、markdown 代码块标记或多余文字。`

exports.main = async (event) => {
  const { title = '', content = '' } = event
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return { error: '未配置 DEEPSEEK_API_KEY 环境变量' }
  }
  if (!content && !title) {
    return { error: '标题和正文不能都为空' }
  }

  const userMsg = `标题：${title}\n正文：${content}`

  try {
    const resp = await axios.post(
      DEEPSEEK_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg }
        ],
        temperature: 1.3,
        max_tokens: 600
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        timeout: 25000
      }
    )

    const data = resp.data
    const text = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || ''

    let poemTitle = ''
    let lines = []
    try {
      let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
      const s = cleaned.indexOf('{')
      const e = cleaned.lastIndexOf('}')
      if (s >= 0 && e > s) cleaned = cleaned.slice(s, e + 1)
      const parsed = JSON.parse(cleaned)
      poemTitle = parsed.title || ''
      lines = parsed.lines || []
      // lines 偶尔会是一个字符串而非数组
      if (typeof lines === 'string') {
        lines = lines.split(/[\n\r,，、]+/).map(x => x.trim()).filter(Boolean)
      }
    } catch (e) {
      // 兑底：先剥掉 title/lines 字段名和 json 符号，再按换行/逗号切
      let raw2 = text
        .replace(/```json/gi, '').replace(/```/g, '')
        .replace(/["'{}\[\]]/g, '')
        .replace(/title\s*[:：].*(\n|$)/i, '')   // 去掉 title 行
        .replace(/lines\s*[:：]/i, '')            // 去掉 lines: 前缀
      lines = raw2.split(/[\n\r,，]+/).map(x => x.trim()).filter(Boolean)
    }

    // 最后再清一遍：去掉每行可能残留的字段名/符号
    lines = lines
      .map(l => String(l).replace(/^(title|lines)\s*[:：]?\s*/i, '').replace(/["'{}\[\]]/g, '').trim())
      .filter(Boolean)

    return { title: poemTitle, lines, raw: text }
  } catch (err) {
    const msg = (err.response && err.response.data && JSON.stringify(err.response.data)) || err.message || String(err)
    return { error: 'DeepSeek 调用失败：' + msg }
  }
}
