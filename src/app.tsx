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
        env: 'cloud1-d5gn77mcqdd2fb47e',
        traceUser: true
      })
    }
  })

  return children
}

export default App
