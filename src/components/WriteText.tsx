import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef } from 'react'
import { HAND_FONTS, fontUrl } from '../constants/fonts'
import './WriteText.scss'

interface Props {
  open: boolean
  onClose: () => void
  onGenerated: (data: { text: string; family: string }) => void
}

export default function WriteText({ open, onClose, onGenerated }: Props) {
  const [text, setText] = useState('')
  const [family, setFamily] = useState('')      // 选中的字体，空=系统默认
  const [loadedFonts, setLoadedFonts] = useState<Record<string, boolean>>({})
  const loadingRef = useRef<Record<string, boolean>>({})

  // 加载某个字体（cloud:// → https → loadFontFace）
  const loadFont = async (f: typeof HAND_FONTS[0]) => {
    if (loadedFonts[f.family] || loadingRef.current[f.family]) {
      setFamily(f.family)
      return
    }
    loadingRef.current[f.family] = true
    try {
      // cloud:// 转 https
      const res = await Taro.cloud.getTempFileURL({ fileList: [fontUrl(f.file)] })
      const url = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL
      if (!url) throw new Error('拿不到字体地址')
      await Taro.loadFontFace({
        family: f.family,
        source: `url("${url}")`,
        global: true,
        scopes: ['webview', 'native'] as any
      } as any)
      setLoadedFonts(prev => ({ ...prev, [f.family]: true }))
      setFamily(f.family)
    } catch (e: any) {
      Taro.showToast({ title: '字体加载失败', icon: 'none' })
      setFamily('')
    } finally {
      loadingRef.current[f.family] = false
    }
  }

  const confirm = () => {
    if (!text.trim()) { Taro.showToast({ title: '写点什么吧', icon: 'none' }); return }
    onGenerated({ text: text.trim(), family })
    setText('')
    onClose()
  }

  if (!open) return null

  return (
    <View className='write-mask'>
      <View className='write-panel'>
        <View className='write-head'>
          <Text className='wh-x' onClick={onClose}>×</Text>
          <Text className='wh-title'>书写</Text>
          <Text className='wh-done' onClick={confirm}>✓</Text>
        </View>

        <Textarea
          className='write-input'
          placeholder='写点什么…'
          value={text}
          maxlength={-1}
          style={{ fontFamily: family || 'inherit' }}
          onInput={e => setText(e.detail.value)}
        />

        {/* 字体选择 */}
        <ScrollView scrollX className='font-list'>
          <View
            className={`font-item ${family === '' ? 'active' : ''}`}
            onClick={() => setFamily('')}
          >默认</View>
          {HAND_FONTS.map(f => (
            <View
              key={f.family}
              className={`font-item ${family === f.family ? 'active' : ''}`}
              style={{ fontFamily: loadedFonts[f.family] ? f.family : 'inherit' }}
              onClick={() => loadFont(f)}
            >{f.label}</View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}
