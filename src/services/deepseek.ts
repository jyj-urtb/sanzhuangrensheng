/**
 * DeepSeek 服务层
 * 小程序不能前端直连 DeepSeek，统一走微信云函数 'deepseek' 中转。
 */
import Taro from '@tarojs/taro'

export interface CollagePoemResult {
  title: string
  lines: string[]
  raw?: string
}

export async function generateCollagePoem(
  title: string,
  content: string
): Promise<CollagePoemResult> {
  const res = await Taro.cloud.callFunction({
    name: 'deepseek',
    data: { title, content }
  })

  const result = (res.result || {}) as any
  if (result.error) {
    throw new Error(result.error)
  }
  return {
    title: result.title || '',
    lines: result.lines || [],
    raw: result.raw || ''
  }
}
