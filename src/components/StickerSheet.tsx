import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import './StickerSheet.scss'

import c69 from '../assets/stickers/color/image 69.jpg'
import c70 from '../assets/stickers/color/image 70.jpg'
import c71 from '../assets/stickers/color/image 71.jpg'
import c72 from '../assets/stickers/color/image 72.jpg'
import c73 from '../assets/stickers/color/image 73.jpg'
import c74 from '../assets/stickers/color/image 74.jpg'
import c75 from '../assets/stickers/color/image 75.jpg'
import c76 from '../assets/stickers/color/image 76.jpg'
import c77 from '../assets/stickers/color/image 77.jpg'
import c78 from '../assets/stickers/color/image 78.jpg'
import c79 from '../assets/stickers/color/image 79.jpg'
import c80 from '../assets/stickers/color/image 80.jpg'
import m64 from '../assets/stickers/meme/image 64.jpg'
import m65 from '../assets/stickers/meme/image 65.jpg'
import m66 from '../assets/stickers/meme/image 66.jpg'
import m67 from '../assets/stickers/meme/image 67.jpg'
import m68 from '../assets/stickers/meme/image 68.jpg'
import r45 from '../assets/stickers/romantic/image 45.jpg'
import r53 from '../assets/stickers/romantic/image 53.jpg'
import r54 from '../assets/stickers/romantic/image 54.jpg'
import r55 from '../assets/stickers/romantic/image 55.jpg'
import r56 from '../assets/stickers/romantic/image 56.jpg'
import r57 from '../assets/stickers/romantic/image 57.jpg'
import r58 from '../assets/stickers/romantic/image 58.jpg'
import r59 from '../assets/stickers/romantic/image 59.jpg'
import r60 from '../assets/stickers/romantic/image 60.jpg'
import r61 from '../assets/stickers/romantic/image 61.jpg'
import r62 from '../assets/stickers/romantic/image 62.jpg'
import r63 from '../assets/stickers/romantic/image 63.jpg'
import s44 from '../assets/stickers/shock/image 44.jpg'
import s46 from '../assets/stickers/shock/image 46.jpg'
import s47 from '../assets/stickers/shock/image 47.jpg'
import s48 from '../assets/stickers/shock/image 48.jpg'
import s49 from '../assets/stickers/shock/image 49.jpg'
import s50 from '../assets/stickers/shock/image 50.jpg'
import s51 from '../assets/stickers/shock/image 51.jpg'
import s52 from '../assets/stickers/shock/image 52.jpg'

const CATEGORIES = [
  { key: 'color', label: '古早炫彩', stickers: [c69,c70,c71,c72,c73,c74,c75,c76,c77,c78,c79,c80] },
  { key: 'meme', label: 'meme', stickers: [m64,m65,m66,m67,m68] },
  { key: 'romantic', label: '千禧年', stickers: [r45,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63] },
  { key: 'shock', label: '重磅推出', stickers: [s44,s46,s47,s48,s49,s50,s51,s52] }
]

interface Props {
  open: boolean
  onClose: () => void
  onPick: (src: string) => void
}

export default function StickerSheet({ open, onClose, onPick }: Props) {
  const [activeCat, setActiveCat] = useState('color')

  if (!open) return null

  return (
    <View className='sticker-mask' catchMove>
      <View className='sticker-sheet' catchMove>
        {/* 第一行：关闭 × */}
        <View className='ss-top'>
          <View className='ss-x' onClick={onClose}>×</View>
        </View>

        {/* 第二行：分类标签 */}
        <ScrollView scrollX className='ss-tabs'>
          {CATEGORIES.map(cat => (
            <View
              key={cat.key}
              className={`ss-tab ${activeCat === cat.key ? 'on' : ''}`}
              onClick={() => setActiveCat(cat.key)}
            >{cat.label}</View>
          ))}
        </ScrollView>

        {/* 贴纸网格 */}
        <ScrollView scrollY className='ss-grid'>
          <View className='ss-row'>
            {CATEGORIES.find(c => c.key === activeCat)?.stickers.map((src, i) => (
              <View key={i} className='ss-item' onClick={() => onPick(src)}>
                <Image className='ss-img' src={src} mode='aspectFill' />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}