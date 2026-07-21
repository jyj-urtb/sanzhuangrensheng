/**
 * 一次性云函数：把内置的 12 个 woff 字体上传到云存储，返回 fileID 列表。
 * 部署后在云开发控制台"云端测试"调用一次即可。之后小程序用返回的 fileID 加载字体。
 */
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const dir = path.join(__dirname, 'fonts')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.woff'))
  const results = {}
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f))
    const r = await cloud.uploadFile({
      cloudPath: 'fonts/' + f,
      fileContent: buf
    })
    results[f] = r.fileID
  }
  return { count: files.length, results }
}
