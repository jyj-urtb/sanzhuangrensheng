/**
 * 拼贴诗工具函数：把文本打碎 + 给每个碎片随机分配样式
 * 分模块，方便单独调整"碎片长什么样"
 */
import {
  FRAGMENT_BG_COLORS,
  FRAGMENT_TEXT_COLORS,
  DARK_BG_TEXT_COLOR,
  FONT_FAMILIES,
  ROTATE_RANGE,
  FONT_SIZE_RANGE
} from '@/constants/collageStyle'

export interface Fragment {
  id: string
  text: string
  fontFamily: string
  fontSize: number
  rotate: number
  bgColor: string
  textColor: string
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 把一段文本打碎成碎片。
 * 优先按标点/换行断句，再对过长句子按字/词进一步切碎，
 * 形成"短句 + 单字 + 碎片段落"混合，符合拼贴质感。
 */
export function splitText(raw: string): string[] {
  if (!raw) return []
  // 先按标点和换行切
  const rough = raw
    .split(/[\n\r，。！？、；：,.!?;:\s]+/)
    .map(s => s.trim())
    .filter(Boolean)

  const pieces: string[] = []
  for (const seg of rough) {
    if (seg.length <= 6) {
      pieces.push(seg)
    } else {
      // 长句随机再切几段
      let i = 0
      while (i < seg.length) {
        const step = Math.floor(rand(2, 6))
        pieces.push(seg.slice(i, i + step))
        i += step
      }
    }
  }
  return pieces
}

/** 给单个碎片文本生成随机样式 */
export function makeFragment(text: string, index: number): Fragment {
  const bgColor = pick(FRAGMENT_BG_COLORS)
  const textColor = bgColor === '#2b2620' ? DARK_BG_TEXT_COLOR : pick(FRAGMENT_TEXT_COLORS)
  return {
    id: `frag-${index}-${Date.now()}`,
    text,
    fontFamily: pick(FONT_FAMILIES),
    fontSize: Math.round(rand(FONT_SIZE_RANGE.min, FONT_SIZE_RANGE.max)),
    rotate: rand(ROTATE_RANGE.min, ROTATE_RANGE.max),
    bgColor,
    textColor
  }
}

/** 把 DeepSeek 返回的碎片数组，转成带样式的 Fragment 列表 */
export function buildFragments(pieces: string[]): Fragment[] {
  return pieces
    .filter(p => p && p.trim())
    .map((p, i) => makeFragment(p.trim(), i))
}
