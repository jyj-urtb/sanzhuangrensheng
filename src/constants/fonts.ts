/**
 * 书写功能字体清单（子集化 woff，存在云存储）
 * 用 Taro.loadFontFace 从云存储 URL 动态加载。
 */
const CLOUD_PREFIX = 'cloud://cloud1-d5gn77mcqdd2fb47e.636c-cloud1-d5gn77mcqdd2fb47e-1456546645/fonts/'

export interface HandFont {
  family: string   // loadFontFace 用的字体名
  label: string    // 面板显示名
  file: string     // 云存储文件名
}

export const HAND_FONTS: HandFont[] = [
  { family: 'HandPop',     label: 'POP体',   file: 'font1.woff' },
  { family: 'HandJiayou',  label: '加油鸭',  file: 'font2.woff' },
  { family: 'HandSaibei',  label: '赛北',    file: 'font3.woff' },
  { family: 'HandShoushu', label: '手书',    file: 'font4.woff' },
  { family: 'HandXingchen',label: '星辰',    file: 'font5.woff' },
  { family: 'HandHeng1',   label: '横1',     file: 'font6.woff' },
  { family: 'HandHeng2',   label: '横2',     file: 'font7.woff' },
  { family: 'HandNishi',   label: '你说',    file: 'font10.woff' },
  { family: 'HandSuibian', label: '随便写',  file: 'font11.woff' },
  { family: 'HandYoudian', label: '有点组',  file: 'font13.woff' },
  { family: 'HandJapan',   label: '和风',    file: 'font14.woff' },
  { family: 'HandYuan',    label: '圆圆',    file: 'font15.woff' }
]

export function fontUrl(file: string) {
  // loadFontFace 需要 https；云存储 cloud:// 需转 https，用 Taro.cloud.getTempFileURL 或直接 https 域名
  return CLOUD_PREFIX + file
}
