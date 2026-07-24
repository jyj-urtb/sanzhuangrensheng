import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import CalendarDrawer from '../../components/CalendarDrawer'
import PaperSheet from '../../components/PaperSheet'
import cameraIcon from '../../assets/icons/camera.png'
import './index.scss'

interface DiaryEntry {
  _id: string
  date: string
  paperSrc: string
  createdAt: string
}

export default function Home() {
  const [statusBarHeight, setStatusBarHeight] = useState(20)
  const [calOpen, setCalOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [entries, setEntries] = useState<DiaryEntry[]>([])

  useDidShow(() => {
    const info = Taro.getWindowInfo?.() || Taro.getSystemInfoSync()
    setStatusBarHeight(info.statusBarHeight || 20)
    loadEntries()
  })

  const loadEntries = async () => {
    try {
      const db = Taro.cloud.database()
      const res = await db.collection('diary_entries')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get()
      console.log('加载的日记数据:', res.data)
      setEntries(res.data as DiaryEntry[])
      if (res.data.length > 0) {
        Taro.showToast({
          title: `加载了 ${res.data.length} 篇日记`,
          icon: 'none',
          duration: 2000
        })
      }
    } catch (e: any) {
      console.error('加载日记失败', e)
      Taro.showToast({
        title: '加载失败: ' + e.message,
        icon: 'none',
        duration: 3000
      })
    }
  }

  const goProfile = () => Taro.navigateTo({ url: '/pages/profile/index' })
  const openEntry = (id: string) => Taro.navigateTo({ url: `/pages/editor/index?id=${id}` })

  const handleCreate = (paperId: string) => {
    setSheetOpen(false)
    Taro.navigateTo({ url: `/pages/editor/index?paper=${paperId}` })
  }

  const handlePhoto = async () => {
    const res = await Taro.showModal({
      title: '提示',
      content: '照片中最好有较为明显的平面，或者您可以自行框选粘贴',
      confirmText: '拍照',
      cancelText: '选图'
    })
    try {
      const r = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: [res.confirm ? 'camera' : 'album']
      })
      Taro.navigateTo({ url: `/pages/editor/index?paper=photo&src=${encodeURIComponent(r.tempFilePaths[0])}` })
    } catch (e) {
      // 用户取消
    }
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
        {entries.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-text'>还没有日记，点击右下角 ＋ 开始创作</Text>
          </View>
        ) : (
          entries.map(e => {
            const date = new Date(e.createdAt)
            const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`
            return (
              <View key={e._id} className='entry'>
                <Text className='entry-date'>{dateStr}</Text>
                <View className='paper-strip' onClick={() => openEntry(e._id)}>
                  <Image className='paper-img' src={e.paperSrc} mode='aspectFill' />
                </View>
              </View>
            )
          })
        )}
        <View className='scroll-bottom-space' />
      </ScrollView>

      {/* 右下角按钮组 */}
      <View className='bottom-btns'>
        <View className='photo-btn' onClick={handlePhoto}>
          <Image className='photo-icon' src={cameraIcon} mode='aspectFit' />
        </View>
        <View className='add-btn' onClick={() => setSheetOpen(true)}>
          <Text className='add-plus'>＋</Text>
        </View>
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
