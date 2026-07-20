import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
    // 初始化云开发环境（DeepSeek 中转 & 数据存储都走这里）
    if (Taro.cloud) {
      Taro.cloud.init({
        // env: 'your-cloud-env-id',  // TODO: 开通云开发后填入你的环境 ID
        traceUser: true
      })
    }
  })

  return children
}

export default App
