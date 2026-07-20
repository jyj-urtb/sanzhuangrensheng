import { useState } from 'react'
import { View, Text, Input, Textarea, Button, MovableArea, MovableView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { generateCollagePoem } from '@/services/deepseek'
import { buildFragments, Fragment } from '@/utils/collage'
import './index.scss'

export default function Collage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [loading, setLoading] = useState(false)
  const [showEditor, setShowEditor] = useState(true)

  const handleGenerate = async () => {
    if (!content.trim() && !title.trim()) {
      Taro.showToast({ title: '写点什么吧', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await generateCollagePoem(title, content)
      const frags = buildFragments(res.fragments)
      setFragments(frags)
      setShowEditor(false)
    } catch (e: any) {
      Taro.showModal({
        title: '生成失败',
        content: e.message || '请检查云函数与 DeepSeek 配置',
        showCancel: false
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReshuffle = () => {
    // 重新随机排布（不重新调用大模型，省钱）
    setFragments(buildFragments(fragments.map(f => f.text)))
  }

  return (
    <View className='collage-page'>
      {showEditor ? (
        <View className='editor-panel paper-shadow'>
          <Text className='panel-title'>写点乱七八糟的</Text>
          <Input
            className='title-input'
            placeholder='标题（可留空）'
            value={title}
            onInput={e => setTitle(e.detail.value)}
          />
          <Textarea
            className='content-input'
            placeholder='人生乱套我睡觉，随便写点……'
            value={content}
            maxlength={-1}
            onInput={e => setContent(e.detail.value)}
          />
          <Button
            className='gen-btn'
            loading={loading}
            onClick={handleGenerate}
          >
            {loading ? '正在打碎…' : '打碎成拼贴诗'}
          </Button>
        </View>
      ) : (
        <View className='collage-canvas'>
          <MovableArea className='movable-area'>
            {fragments.map(f => (
              <MovableView
                key={f.id}
                className='frag'
                direction='all'
                style={{
                  fontFamily: f.fontFamily,
                  fontSize: `${f.fontSize}rpx`,
                  transform: `rotate(${f.rotate}deg)`,
                  backgroundColor: f.bgColor,
                  color: f.textColor,
                  padding: f.bgColor === 'transparent' ? '0' : '4rpx 10rpx'
                }}
                x={Math.random() * 500}
                y={Math.random() * 900}
              >
                {f.text}
              </MovableView>
            ))}
          </MovableArea>

          <View className='toolbar'>
            <Button className='tool-btn' onClick={handleReshuffle}>重新散落</Button>
            <Button className='tool-btn' onClick={() => setShowEditor(true)}>改文字</Button>
          </View>
        </View>
      )}
    </View>
  )
}
