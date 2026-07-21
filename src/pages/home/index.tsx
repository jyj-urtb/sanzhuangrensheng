import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { PAPERS, CARDS } from '../../constants/papers'
import CalendarDrawer from '../../components/CalendarDrawer'
import PaperSheet from '../../components/PaperSheet'
import './index.scss'

interface DiaryEntry {
  id: string
  date: string
  paperSrc: string
}

export default function Home() {
  const [statusBarHeight, setStatusBarHeight] = useState(20)
  const [calOpen, setCalOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useLoad(() => {
    const info = Taro.getWindowInfo?.() || Taro.getSystemInfoSync()
    setStatusBarHeight(info.statusBarHeight || 20)
  })

  const entries: DiaryEntry[] = [
    { id: 'e1', date: '7月12日', paperSrc: PAPERS[0].src },
    { id: 'e2', date: '6月2日', paperSrc: PAPERS[5].src },
    { id: 'e3', date: '3月1日', paperSrc: PAPERS[8].src },
    { id: 'e4', date: '1月12日', paperSrc: CARDS[0].src }
  ]

  const goProfile = () => Taro.navigateTo({ url: '/pages/profile/index' })
  const openEntry = (id: string) => Taro.navigateTo({ url: `/pages/editor/index?id=${id}` })

  const handleCreate = (paperId: string) => {
    setSheetOpen(false)
    Taro.navigateTo({ url: `/pages/editor/index?paper=${paperId}` })
  }

  return (
    <View className='home-page'>
      {/* 顶部：左 ☰（开日历）右 👤 */}
      <View className='top-bar' style={{ paddingTop: `${statusBarHeight + 12}px` }}>
        <View className='icon-btn menu-btn' onClick={() => setCalOpen(true)}>
          <View className='bar' />
          <View className='bar' />
          <View className='bar' />
        </View>
        <View className='icon-btn profile-btn' onClick={goProfile}>
          <View className='avatar-head' />
          <View className='avatar-body' />
        </View>
      </View>

      {/* 日记纸条堆叠 */}
      <ScrollView scrollY className='strip-scroll'>
        {entries.map(e => (
          <View key={e.id} className='entry'>
            <Text className='entry-date'>{e.date}</Text>
            <View className='paper-strip' onClick={() => openEntry(e.id)}>
              <Image className='paper-img' src={e.paperSrc} mode='aspectFill' />
            </View>
          </View>
        ))}
        <View className='scroll-bottom-space' />
      </ScrollView>

      {/* 右下角新建按钮 */}
      <View className='add-btn' onClick={() => setSheetOpen(true)}>
        <Text className='add-plus'>＋</Text>
      </View>

      {/* 左滑出日历抽屉 + 半透明遮罩 */}
      {calOpen && <View className='cal-mask' onClick={() => setCalOpen(false)} />}
      <CalendarDrawer
        open={calOpen}
        statusBarHeight={statusBarHeight}
        onClose={() => setCalOpen(false)}
      />

      {/* 新建一页底部弹窗 */}
      <PaperSheet
        open={sheetOpen}
        onCancel={() => setSheetOpen(false)}
        onCreate={handleCreate}
      />
    </View>
  )
}
