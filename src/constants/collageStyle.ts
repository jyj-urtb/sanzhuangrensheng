/**
 * 拼贴诗渲染用的样式常量
 * 分模块管理，方便后续增删调整
 */

/** 碎片可用的填充底色（马克笔/便签/剪报高亮质感，偏旧偏脏，符合反秩序基调） */
export const FRAGMENT_BG_COLORS = [
  'transparent',      // 无底色（大部分碎片）
  '#f7e05c',          // 荧光黄
  '#f4a3a3',          // 旧粉
  '#a8d8b9',          // 褪色绿
  '#f4c98a',          // 牛皮纸橙
  '#bcd3f0',          // 淡蓝
  '#2b2620',          // 黑底（配白字，剪报感）
]

/** 黑底时用的文字色 */
export const DARK_BG_TEXT_COLOR = '#f4efe4'

/** 碎片文字色候选（默认深墨色，偶尔红/蓝，像不同笔写的） */
export const FRAGMENT_TEXT_COLORS = [
  '#2b2620',
  '#2b2620',
  '#2b2620',
  '#8a2b2b',   // 暗红
  '#2b4a8a',   // 钢笔蓝
]

/**
 * 字体族。小程序默认可用的很有限；
 * 自定义 ttf 需 wx.loadFontFace 动态加载（P3 再接，主包塞不下 30+ 字体）。
 * 这里先用系统可区分的几种制造"拼贴混排感"。
 */
export const FONT_FAMILIES = [
  'PingFang SC',
  'STSong',        // 宋体，正式感
  'STKaiti',       // 楷体，手写感
  'sans-serif',
  'serif',
]

/** 碎片旋转角度范围（度），制造散落倾斜感 */
export const ROTATE_RANGE = { min: -12, max: 12 }

/** 碎片字号范围（rpx） */
export const FONT_SIZE_RANGE = { min: 30, max: 64 }
