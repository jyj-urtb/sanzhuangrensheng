import { View, Text, Input, Textarea, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { generateCollagePoem } from '../services/deepseek'
import { buildPoem, CollagePoem } from '../utils/collage'
import loadingImg from '../assets/loading.png'
import './CollageDialog.scss'

interface Props {
  open: boolean
  onClose: () => void
  onGenerated: (poem: CollagePoem) => void
}

type Mode = 'ai' | 'raw'

export default function CollageDialog({ open, onClose, onGenerated }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('raw')

  const splitRaw = (text: string): string[] =>
    text.split(/[\n\r，。！？、；：,.!?;:\s]+/).map(s => s.trim()).filter(Boolean)

  const handleGenerate = async () => {
    if (!content.trim() && !title.trim()) {
      Taro.showToast({ title: '写点碎碎念吧', icon: 'none' })
      return
    }
    if (mode === 'raw') {
      const poem = buildPoem(title.trim(), splitRaw(content || title))
      onGenerated(poem)
      setTitle(''); setContent(''); onClose()
      return
    }
    setLoading(true)
    try {
      const res = await generateCollagePoem(title, content)
      const finalTitle = title.trim() ? res.title : ''
      onGenerated(buildPoem(finalTitle, res.lines))
      setTitle(''); setContent(''); onClose()
    } catch (e: any) {
      Taro.showModal({ title: '生成失败', content: e.message || '请稍后再试', showCancel: false })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <View className='collage-dialog-mask'>
      <View className='collage-dialog'>
        {/* 左上关闭 / 右上生成 */}
        <View className='dialog-actions'>
          <View className='act-btn close-btn' onClick={onClose}>
            <Text className='act-icon'>×</Text>
          </View>
          <View className={`act-btn done-btn ${loading ? 'loading' : ''}`} onClick={handleGenerate}>
            <Text className='act-icon'>{loading ? '…' : '✓'}</Text>
          </View>
        </View>

        <Text className='dialog-title'>剪碎（拼贴）</Text>

        {/* 模式切换 */}
        <View className='mode-switch'>
          <View className={`mode-slider ${mode === 'raw' ? 'right' : ''}`} />
          <View className={`mode-item ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>AI 散文诗</View>
          <View className={`mode-item ${mode === 'raw' ? 'active' : ''}`} onClick={() => setMode('raw')}>原文打散</View>
        </View>

        <Input
          className='dialog-title-input'
          placeholder='标题'
          value={title}
          onInput={e => setTitle(e.detail.value)}
        />
        <Textarea
          className='dialog-content-input'
          placeholder='请输入你的碎碎念…'
          value={content}
          maxlength={-1}
          onInput={e => setContent(e.detail.value)}
        />

        {loading && (
          <View className='gen-loading'>
            <Image className='loading-img' src={loadingImg} mode='aspectFit' />
            <Text className='loading-txt'>加急书写中…</Text>
          </View>
        )}
      </View>
    </View>
  )
}
