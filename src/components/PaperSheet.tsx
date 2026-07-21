import { View, Text, Image, ScrollView } from '@tarojs/components'
import { PAPERS, CARDS } from '../constants/papers'
import { useState } from 'react'
import './PaperSheet.scss'

interface Props {
  open: boolean
  onCancel: () => void
  onCreate: (paperId: string) => void
}

export default function PaperSheet({ open, onCancel, onCreate }: Props) {
  const [selected, setSelected] = useState<string>('')

  const handleCreate = () => {
    if (!selected) return
    onCreate(selected)
  }

  return (
    <View className={`paper-sheet-wrap ${open ? 'open' : ''}`}>
      {/* 遮罩 + 上方露出首页区域，点击取消 */}
      <View className='sheet-mask' onClick={onCancel} />

      {/* 底部弹窗 */}
      <View className='sheet'>
        {/* 顶部：取消 / 新的一页 / 创建 */}
        <View className='sheet-top'>
          <Text className='cancel' onClick={onCancel}>取消</Text>
          <Text className='sheet-title'>新的一页</Text>
          <Text className={`create ${selected ? 'active' : ''}`} onClick={handleCreate}>创建</Text>
        </View>

        <ScrollView scrollY className='sheet-scroll'>
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

          <Text className='section-label card-label'>卡纸（适合拼贴记录）</Text>
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
      </View>
    </View>
  )
}
