/**
 * DeepSeek 服务层
 * 小程序不能前端直连 DeepSeek（域名白名单 + Key 暴露风险），
 * 所以统一走微信云函数 'deepseek' 中转。
 * 前端只调云函数，Key 存在云函数环境里，绝不出现在前端代码。
 */
import Taro from '@tarojs/taro'

export interface CollagePoemResult {
  /** DeepSeek 改造后拆出的碎片列表 */
  fragments: string[]
  /** 原始诗文本（可选，用于展示/存档） */
  raw?: string
}

/**
 * 调用 DeepSeek 生成拼贴诗碎片
 * @param title 用户输入的标题
 * @param content 用户输入的日记正文
 */
export async function generateCollagePoem(
  title: string,
  content: string
): Promise<CollagePoemResult> {
  // 云函数调用
  const res = await Taro.cloud.callFunction({
    name: 'deepseek',
    data: { title, content }
  })

  const result = (res.result || {}) as any
  if (result.error) {
    throw new Error(result.error)
  }
  return {
    fragments: result.fragments || [],
    raw: result.raw || ''
  }
}
