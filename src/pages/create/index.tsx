import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { PAPERS, CARDS } from '../../constants/papers'
import './index.scss'

export default function Create() {
  const [statusBarHeight, setStatusBarHeight] = useState(20)
  const [selected, setSelected] = useState<string>('')

  useLoad(() => {
    const info = Taro.getWindowInfo?.() || Taro.getSystemInfoSync()
    setStatusBarHeight(info.statusBarHeight || 20)
  })

  const handleCreate = () => {
    if (!selected) {
      Taro.showToast({ title: '先选一张纸', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: `/pages/editor/index?paper=${selected}` })
  }

  return (
    <View className='create-page'>
      <View className='top-bar' style={{ paddingTop: `${statusBarHeight + 12}px` }}>
        <Text className='back' onClick={() => Taro.navigateBack()}>‹</Text>
        <Text className='title'>新建一页</Text>
        <View className='placeholder' />
      </View>

      <ScrollView scrollY className='paper-scroll'>
        <Text className='section-label'>日记纸</Text>
        <View className='paper-grid'>
          {PAPERS.map(p => (
            <View
              key={p.id}
              className={`paper-thumb ${selected === p.id ? 'active' : ''}`}
              onClick={() => setSelected(p.id)}
            >
              <Image className='thumb-img' src={p.src} mode='aspectFill' />
            </View>
          ))}
        </View>

        <Text className='section-label'>卡纸</Text>
        <View className='paper-grid'>
          {CARDS.map(p => (
            <View
              key={p.id}
              className={`paper-thumb ${selected === p.id ? 'active' : ''}`}
              onClick={() => setSelected(p.id)}
            >
              <Image className='thumb-img' src={p.src} mode='aspectFill' />
            </View>
          ))}
        </View>
        <View className='bottom-space' />
      </ScrollView>

      <View className='create-bar'>
        <View className='create-btn' onClick={handleCreate}>创建</View>
      </View>
    </View>
  )
}
