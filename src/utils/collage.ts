/**
 * 拼贴诗渲染数据构建
 * DeepSeek 返回 { title, lines[] }，前端把每行切成 1-2 个碎片，
 * 竖向成行排列（可读的诗），每个碎片带剪报样式 + 可拖拽微调。
 */

// 3 种衬线体轮换（制造"不同报纸剪下来"的感觉，先用系统 serif 兜底）
const FONTS = ['CollageSong', 'CollageBao', 'CollageAntique', 'serif']

// 底色：旧纸系、低饱和、复古——黄纸/发青打印纸/白纸/黑纸/旧旧的感觉，不要鲜艳色
const BG_STYLES = [
  { bg: '#efe9dc', color: '#2b2620' },   // 旧纸白（最常见）
  { bg: '#efe9dc', color: '#2b2620' },
  { bg: '#f0ead3', color: '#2b2620' },   // 发黄旧纸
  { bg: '#e4e7dd', color: '#2b2620' },   // 发青打印纸
  { bg: '#f4f2ec', color: '#2b2620' },   // 白纸
  { bg: '#ddd8c8', color: '#2b2620' },   // 深一点的旧纸
  { bg: '#2b2620', color: '#f2ede0' },   // 黑底白字（点缀）
]

export interface Fragment {
  id: string
  text: string
  fontFamily: string
  bg: string
  color: string
  rotate: number
  offsetX: number   // 拖拽微调用（初始 0）
  offsetY: number
}

export interface CollageRow {
  id: string
  fragments: Fragment[]
}

export interface CollagePoem {
  title: string
  rows: CollageRow[]
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 把一行切成 1-2 段（长句才切）
function splitLine(line: string): string[] {
  const s = line.trim()
  if (s.length <= 7) return [s]
  // 有标点就在标点处切一次
  const m = s.match(/[，。、；：,.!?！？]/)
  if (m && m.index && m.index > 1 && m.index < s.length - 1) {
    return [s.slice(0, m.index + 1), s.slice(m.index + 1)].filter(Boolean)
  }
  // 否则中间随机切
  const cut = Math.floor(rand(s.length * 0.4, s.length * 0.6))
  return [s.slice(0, cut), s.slice(cut)]
}

let seq = 0
function makeFragment(text: string): Fragment {
  const style = pick(BG_STYLES)
  seq++
  return {
    id: `f-${seq}-${Date.now()}`,
    text,
    fontFamily: pick(FONTS),
    bg: style.bg,
    color: style.color,
    rotate: rand(-2.5, 2.5),   // 轻微不规则，不大散落
    offsetX: 0,
    offsetY: 0
  }
}

export function buildPoem(title: string, lines: string[]): CollagePoem {
  const clean = (s: string) =>
    String(s)
      .replace(/^(title|lines)\s*[:：]?\s*/i, '')
      .replace(/["'{}\[\]]/g, '')
      .trim()
  const rows: CollageRow[] = lines
    .map(clean)
    .filter(l => l && l.trim())
    .map((line, i) => ({
      id: `row-${i}`,
      fragments: splitLine(line).map(makeFragment)
    }))
  return { title: clean(title), rows }
}
