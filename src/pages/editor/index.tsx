import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState, useRef } from 'react'
import { getPaperById, PAPERS } from '../../constants/papers'
import CollageDialog from '../../components/CollageDialog'
import PhotoSticker from '../../components/PhotoSticker'
import Doodle from '../../components/Doodle'
import { CollagePoem } from '../../utils/collage'
import { HAND_FONTS, fontUrl } from '../../constants/fonts'
import tex1 from '../../assets/texture/tex1.jpg'
// 顶部功能入口（贴纸样式）
import topCollage from '../../assets/tools/collega.png'
import topSticker from '../../assets/tools/sticker.png'
// 底部工具栏（4 个）
import iconPaint from '../../assets/tools/paint.png'
import iconPhoto from '../../assets/tools/togther.png'
import iconPen from '../../assets/tools/pen.png'
import iconMatch from '../../assets/tools/match.png'
import './index.scss'

// 贴纸库
import c69 from '../../assets/stickers/color/image 69.jpg'
import c70 from '../../assets/stickers/color/image 70.jpg'
import c71 from '../../assets/stickers/color/image 71.jpg'
import c72 from '../../assets/stickers/color/image 72.jpg'
import c73 from '../../assets/stickers/color/image 73.jpg'
import c74 from '../../assets/stickers/color/image 74.jpg'
import c75 from '../../assets/stickers/color/image 75.jpg'
import c76 from '../../assets/stickers/color/image 76.jpg'
import c77 from '../../assets/stickers/color/image 77.jpg'
import c78 from '../../assets/stickers/color/image 78.jpg'
import c79 from '../../assets/stickers/color/image 79.jpg'
import c80 from '../../assets/stickers/color/image 80.jpg'
import m64 from '../../assets/stickers/meme/image 64.jpg'
import m65 from '../../assets/stickers/meme/image 65.jpg'
import m66 from '../../assets/stickers/meme/image 66.jpg'
import m67 from '../../assets/stickers/meme/image 67.jpg'
import m68 from '../../assets/stickers/meme/image 68.jpg'
import r45 from '../../assets/stickers/romantic/image 45.jpg'
import r53 from '../../assets/stickers/romantic/image 53.jpg'
import r54 from '../../assets/stickers/romantic/image 54.jpg'
import r55 from '../../assets/stickers/romantic/image 55.jpg'
import r56 from '../../assets/stickers/romantic/image 56.jpg'
import r57 from '../../assets/stickers/romantic/image 57.jpg'
import r58 from '../../assets/stickers/romantic/image 58.jpg'
import r59 from '../../assets/stickers/romantic/image 59.jpg'
import r60 from '../../assets/stickers/romantic/image 60.jpg'
import r61 from '../../assets/stickers/romantic/image 61.jpg'
import r62 from '../../assets/stickers/romantic/image 62.jpg'
import r63 from '../../assets/stickers/romantic/image 63.jpg'
import s44 from '../../assets/stickers/shock/image 44.jpg'
import s46 from '../../assets/stickers/shock/image 46.jpg'
import s47 from '../../assets/stickers/shock/image 47.jpg'
import s48 from '../../assets/stickers/shock/image 48.jpg'
import s49 from '../../assets/stickers/shock/image 49.jpg'
import s50 from '../../assets/stickers/shock/image 50.jpg'
import s51 from '../../assets/stickers/shock/image 51.jpg'
import s52 from '../../assets/stickers/shock/image 52.jpg'

const STICKER_CATS = [
  { label: '古早炫彩', stickers: [c69,c70,c71,c72,c73,c74,c75,c76,c77,c78,c79,c80] },
  { label: 'meme', stickers: [m64,m65,m66,m67,m68] },
  { label: '千禧年', stickers: [r45,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63] },
  { label: '重磅推出', stickers: [s44,s46,s47,s48,s49,s50,s51,s52] }
]

export default function Editor() {
  const router = useRouter()
  const [statusBarHeight, setStatusBarHeight] = useState(20)
  const [paperSrc, setPaperSrc] = useState(PAPERS[0].src)
  const [collageOpen, setCollageOpen] = useState(false)
  const [poem, setPoem] = useState<CollagePoem | null>(null)
  const [poemEdit, setPoemEdit] = useState(false)
  const [activeTop, setActiveTop] = useState<'' | 'collage' | 'sticker'>('')
  const [photoOpen, setPhotoOpen] = useState(false)
  const [photos, setPhotos] = useState<{ id: string; src: string; x: number; y: number }[]>([])
  const [selectedId, setSelectedId] = useState('')
  const dragRef = useRef({ id: '', startX: 0, startY: 0, baseX: 0, baseY: 0 })
  const [texts, setTexts] = useState<{ id: string; text: string; family: string; x: number; y: number; chars: { c: string; r: number; s: number; dy: number }[] }[]>([])
  const [editingTextId, setEditingTextId] = useState('')
  const [fontPickerId, setFontPickerId] = useState('')
  const [doodleOpen, setDoodleOpen] = useState(false)
  const [doodles, setDoodles] = useState<{ id: string; src: string }[]>([])
  const [activeBottom, setActiveBottom] = useState('')
  const [saveDate, setSaveDate] = useState('')
  const [stickerOpen, setStickerOpen] = useState(false)
  const [activeStickerCat, setActiveStickerCat] = useState(0)
  const [stickers, setStickers] = useState<{ id: string; src: string; x: number; y: number }[]>([])

  // 贴纸操作模式：none | drag | rotate | scale
  const stickerOpRef = useRef<{ id: string; mode: string; startX: number; startY: number; baseX: number; baseY: number; baseRotate: number; baseScale: number; startAngle: number; startDist: number }>({ id: '', mode: 'none', startX: 0, startY: 0, baseX: 0, baseY: 0, baseRotate: 0, baseScale: 1, startAngle: 0, startDist: 0 })

  useLoad(() => {
    const info = Taro.getWindowInfo?.() || Taro.getSystemInfoSync()
    setStatusBarHeight(info.statusBarHeight || 20)
    const paperId = router.params.paper
    if (paperId) {
      const p = getPaperById(paperId)
      if (p) setPaperSrc(p.src)
    }
    
    // 从日历传递的日期参数
    const dateParam = router.params.date
    if (dateParam) {
      setSaveDate(dateParam)
    }
    
    // 加载已保存的日记
    const diaryId = router.params.id
    if (diaryId) {
      loadSavedDiary(diaryId)
    }
  })

  const loadSavedDiary = async (id: string) => {
    try {
      const db = Taro.cloud.database()
      const res = await db.collection('diary_entries').doc(id).get()
      const diary = res.data
      
      if (diary) {
        // 恢复纸张
        if (diary.paperSrc) setPaperSrc(diary.paperSrc)
        // 恢复拼贴诗
        if (diary.poem) setPoem(diary.poem)
        // 恢复照片贴纸
        if (diary.photos && diary.photos.length > 0) {
          // 需要将云存储的fileID转换为临时URL
          const fileIDs = diary.photos.map((p: any) => p.src)
          const urlRes = await Taro.cloud.getTempFileURL({ fileList: fileIDs })
          const photosWithUrl = diary.photos.map((p: any, i: number) => ({
            ...p,
            src: urlRes.fileList[i].tempFileURL
          }))
          setPhotos(photosWithUrl)
        }
        // 恢复手写文字
        if (diary.texts && diary.texts.length > 0) {
          setTexts(diary.texts)
        }
        // 恢复涂鸦
        if (diary.doodles && diary.doodles.length > 0) {
          const doodleFileIDs = diary.doodles.map((d: any) => d.src)
          const doodleUrlRes = await Taro.cloud.getTempFileURL({ fileList: doodleFileIDs })
          const doodlesWithUrl = diary.doodles.map((d: any, i: number) => ({
            ...d,
            src: doodleUrlRes.fileList[i].tempFileURL
          }))
          setDoodles(doodlesWithUrl)
        }
      }
    } catch (e) {
      console.error('加载日记失败', e)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    }
  }

  const bottomTools = [
    { id: 'paint', icon: iconPaint, cls: 'tool-paint' },
    { id: 'photo', icon: iconPhoto, cls: 'tool-photo' },
    { id: 'write', icon: iconPen, cls: 'tool-pen' },
    { id: 'burn', icon: iconMatch, cls: 'tool-match' }
  ]

  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuAction = async (action: string) => {
    setMenuOpen(false)
    switch (action) {
      case 'save':
        await saveDiary()
        break
      case 'delete':
        Taro.showModal({
          title: '确认删除',
          content: '删除后无法恢复，确定要删除吗？',
          success: async (res) => {
            if (res.confirm) {
              // 软删除：标记为已删除而不是真正删除
              const diaryId = router.params.id
              if (diaryId) {
                try {
                  const db = Taro.cloud.database()
                  await db.collection('diary_entries').doc(diaryId).update({
                    data: { deleted: true }
                  })
                  Taro.showToast({ title: '已删除', icon: 'success' })
                  setTimeout(() => Taro.navigateBack(), 1500)
                } catch (e: any) {
                  Taro.showToast({ title: '删除失败', icon: 'none' })
                }
              } else {
                Taro.navigateBack()
              }
            }
          }
        })
        break
      case 'share':
        Taro.showToast({ title: '分享功能开发中', icon: 'none' })
        break
    }
  }

  const saveDiary = async () => {
    Taro.showLoading({ title: '保存中...' })
    try {
      // 上传涂鸦到云存储
      const doodleUrls = await Promise.all(
        doodles.map(async (d) => {
          const res = await Taro.cloud.uploadFile({
            cloudPath: `doodles/${Date.now()}-${d.id}.png`,
            filePath: d.src
          })
          return { id: d.id, src: res.fileID }
        })
      )

      // 上传照片到云存储
      const photoUrls = await Promise.all(
        photos.map(async (p) => {
          const res = await Taro.cloud.uploadFile({
            cloudPath: `photos/${Date.now()}-${p.id}.png`,
            filePath: p.src
          })
          return { id: p.id, src: res.fileID, x: p.x, y: p.y }
        })
      )

      // 保存到数据库
      const db = Taro.cloud.database()
      const now = new Date()
      const diaryId = router.params.id
      
      const diaryData = {
        paperSrc,
        poem,
        photos: photoUrls,
        texts,
        doodles: doodleUrls,
        updatedAt: now,
        deleted: false
      }
      
      if (diaryId) {
        // 更新现有日记
        await db.collection('diary_entries').doc(diaryId).update({
          data: diaryData
        })
      } else {
        // 创建新日记
        await db.collection('diary_entries').add({
          data: {
            ...diaryData,
            createdAt: saveDate ? new Date(saveDate) : now
          }
        })
      }

      Taro.hideLoading()
      Taro.showToast({ title: '保存成功', icon: 'success' })
    } catch (e: any) {
      Taro.hideLoading()
      Taro.showToast({ title: '保存失败：' + (e.message || '未知错误'), icon: 'none' })
    }
  }

  const handleTool = (id: string) => {
    setActiveBottom(id)
    if (id === 'collage') {
      if (poem) {
        Taro.showToast({ title: '页面已有前人，后来者请移步下一页！', icon: 'none' })
        return
      }
      setActiveTop('collage')
      setCollageOpen(true)
      return
    }
    if (id === 'sticker') {
      setActiveTop('sticker')
      setStickerOpen(true)
      return
    }
    if (id === 'paint') {
      setDoodleOpen(true)   // 涂鸦
      return
    }
    if (id === 'write') {
      // 直接在纸上新增一个可编辑文本框
      const nid = 'tx-' + Date.now()
      setTexts(prev => [...prev, { id: nid, text: '', family: '', x: 60, y: 200, chars: [] }])
      setEditingTextId(nid)
      setFontPickerId('')
      return
    }
    if (id === 'photo') {
      setPhotoOpen(true)   // 照片贴纸
      return
    }
    Taro.showToast({ title: '该工具开发中', icon: 'none' })
  }

  // 贴纸拖动
  const onStickerStart = (id: string, e: any) => {
    const t = e.touches[0]
    const ph = photos.find(p => p.id === id)
    setSelectedId(id)
    dragRef.current = { id, startX: t.clientX, startY: t.clientY, baseX: ph ? ph.x : 0, baseY: ph ? ph.y : 0 }
  }
  const onStickerMove = (e: any) => {
    const d = dragRef.current
    if (!d.id) return
    const t = e.touches[0]
    const nx = d.baseX + (t.clientX - d.startX)
    const ny = d.baseY + (t.clientY - d.startY)
    setPhotos(prev => prev.map(p => p.id === d.id ? { ...p, x: nx, y: ny } : p))
  }
  const onStickerEnd = () => { dragRef.current = { id: '', startX: 0, startY: 0, baseX: 0, baseY: 0 } }

  // 拼贴诗：点诗区进入编辑模式，编辑模式下拖动单个碎片
  const fragDragRef = useRef({ id: '', startX: 0, startY: 0, baseX: 0, baseY: 0 })
  const onFragStart = (fid: string, e: any) => {
    if (!poemEdit) return
    const t = e.touches[0]
    let bx = 0, by = 0
    poem?.rows.forEach(r => r.fragments.forEach(f => { if (f.id === fid) { bx = f.offsetX; by = f.offsetY } }))
    fragDragRef.current = { id: fid, startX: t.clientX, startY: t.clientY, baseX: bx, baseY: by }
  }
  const onFragMove = (e: any) => {
    const d = fragDragRef.current
    if (!d.id || !poem) return
    const t = e.touches[0]
    const nx = d.baseX + (t.clientX - d.startX)
    const ny = d.baseY + (t.clientY - d.startY)
    setPoem({
      ...poem,
      rows: poem.rows.map(r => ({
        ...r,
        fragments: r.fragments.map(f => f.id === d.id ? { ...f, offsetX: nx, offsetY: ny } : f)
      }))
    })
  }
  const onFragEnd = () => { fragDragRef.current = { id: '', startX: 0, startY: 0, baseX: 0, baseY: 0 } }

  // 书写文本块拖动
  const textDragRef = useRef({ id: '', startX: 0, startY: 0, baseX: 0, baseY: 0 })
  const onTextStart = (id: string, e: any) => {
    const t = e.touches[0]
    const it = texts.find(x => x.id === id)
    setSelectedId(id)
    textDragRef.current = { id, startX: t.clientX, startY: t.clientY, baseX: it ? it.x : 0, baseY: it ? it.y : 0 }
  }
  const onTextMove = (e: any) => {
    const d = textDragRef.current
    if (!d.id) return
    const t = e.touches[0]
    setTexts(prev => prev.map(x => x.id === d.id ? { ...x, x: d.baseX + (t.clientX - d.startX), y: d.baseY + (t.clientY - d.startY) } : x))
  }
  const onTextEnd = () => { textDragRef.current = { id: '', startX: 0, startY: 0, baseX: 0, baseY: 0 } }

  // 把文本拆成带随机歪斜/大小的字
  const buildChars = (str: string) =>
    Array.from(str).map(c => ({
      c,
      r: (Math.random() * 16 - 8),
      s: (0.85 + Math.random() * 0.4),
      dy: (Math.random() * 10 - 5)
    }))

  // 书写：输入、选字体、完成
  const loadedFontsRef = useRef<Record<string, boolean>>({})
  const onTextInput = (id: string, val: string) => {
    setTexts(prev => prev.map(x => x.id === id ? { ...x, text: val, chars: buildChars(val) } : x))
  }
  const chooseFont = async (id: string, f: typeof HAND_FONTS[0]) => {
    if (!loadedFontsRef.current[f.family]) {
      try {
        const res = await Taro.cloud.getTempFileURL({ fileList: [fontUrl(f.file)] })
        const url = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL
        if (url) {
          await Taro.loadFontFace({ family: f.family, source: `url("${url}")`, global: true } as any)
          loadedFontsRef.current[f.family] = true
        }
      } catch (e) { Taro.showToast({ title: '字体加载失败', icon: 'none' }) }
    }
    setTexts(prev => prev.map(x => x.id === id ? { ...x, family: f.family } : x))
  }

  return (
    <View className='editor-page'>
      {/* 顶部：左白圆返回 / 右米黄圆菜单 */}
      <View className='top-bar' style={{ paddingTop: `${statusBarHeight + 12}px` }}>
        <View className='round-btn back-btn' onClick={() => Taro.navigateBack()}>
          <Text className='chev'>‹</Text>
        </View>
        <View className='round-btn menu-btn' onClick={() => setMenuOpen(!menuOpen)}>
          <Text className='dots'>⋮</Text>
        </View>
      </View>

      {/* 下拉菜单 */}
      {menuOpen && (
        <View className='menu-overlay' onClick={() => setMenuOpen(false)}>
          <View className='menu-dropdown' style={{ top: `${statusBarHeight + 70}px` }} onClick={e => e.stopPropagation()}>
            <View className='menu-item' onClick={() => handleMenuAction('save')}>
              <Text>保存</Text>
            </View>
            <View className='menu-item' onClick={() => handleMenuAction('share')}>
              <Text>分享</Text>
            </View>
            <View className='menu-item delete' onClick={() => handleMenuAction('delete')}>
              <Text>删除</Text>
            </View>
          </View>
        </View>
      )}

      {/* 纸张画布区（顶部压两张功能贴纸：拼贴诗 / 贴画） */}
      <View className='canvas-area'>
        <View className='top-stickers'>
          <Image
            className={`sticker-btn collage-sticker ${activeTop === 'collage' ? 'active' : ''}`}
            src={topCollage}
            mode='aspectFit'
            onClick={() => handleTool('collage')}
          />
          <Image
            className={`sticker-btn draw-sticker ${activeTop === 'sticker' ? 'active' : ''}`}
            src={topSticker}
            mode='aspectFit'
            onClick={() => handleTool('sticker')}
          />
        </View>

        {/* 纸张 + 贴在纸上的拼贴诗 */}
        <View className='canvas-wrap'
          onTouchMove={(e) => {
            const op = stickerOpRef.current
            if (!op.id || op.mode === 'none') return
            const t = e.touches[0]
            if (op.mode === 'drag') {
              setStickers(prev => prev.map(p => p.id === op.id ? { ...p, x: op.baseX + (t.clientX - op.startX), y: op.baseY + (t.clientY - op.startY) } : p))
            } else if (op.mode === 'rotate') {
              const sk = stickers.find(s => s.id === op.id)
              if (!sk) return
              const cx = sk.x + 120
              const cy = sk.y + 120
              const angle = Math.atan2(t.clientY - cy, t.clientX - cx)
              const delta = (angle - op.startAngle) * (180 / Math.PI)
              setStickers(prev => prev.map(p => p.id === op.id ? { ...p, rotate: op.baseRotate + delta } : p))
            } else if (op.mode === 'scale') {
              const sk = stickers.find(s => s.id === op.id)
              if (!sk) return
              const cx = sk.x + 120
              const cy = sk.y + 120
              const dist = Math.sqrt((t.clientX - cx) ** 2 + (t.clientY - cy) ** 2)
              const ratio = op.startDist > 0 ? dist / op.startDist : 1
              const newScale = Math.max(0.3, Math.min(2.5, op.baseScale * ratio))
              setStickers(prev => prev.map(p => p.id === op.id ? { ...p, scale: newScale } : p))
            }
          }}
          onTouchEnd={() => { stickerOpRef.current = { ...stickerOpRef.current, mode: 'none' } }}
        >
          <Image className='canvas-paper' src={paperSrc} mode='aspectFill' />

          {poem && (
            <View
              className={`poem-layer ${poemEdit ? 'editing' : ''}`}
            >
              {poem.title ? (
                <View className='poem-title-wrap'>
                  <View className='pfrag pfrag-title'>
                    <Text className='pfrag-text ptitle'>{poem.title}</Text>
                  </View>
                </View>
              ) : null}
              {poem.rows.map((row, ri) => (
                <View
                  key={row.id}
                  className='poem-row'
                  style={{ marginLeft: `${(ri % 3) * 18}rpx` }}
                >
                  {row.fragments.map((f) => (
                    <View
                      key={f.id}
                      className='pfrag'
                      style={{
                        backgroundColor: f.bg,
                        transform: `translate(${f.offsetX}px, ${f.offsetY}px) rotate(${f.rotate}deg)`,
                        zIndex: (f.offsetX || f.offsetY) ? 3 : 1
                      }}
                      catchMove={poemEdit}
                      onTouchStart={(e) => onFragStart(f.id, e)}
                      onTouchMove={onFragMove}
                      onTouchEnd={onFragEnd}
                      onClick={() => { if (!poemEdit) setPoemEdit(true) }}
                    >
                      <Image className='pfrag-tex' src={tex1} mode='aspectFill' />
                      <Text className='pfrag-text' style={{ color: f.color, fontFamily: f.fontFamily }}>{f.text}</Text>
                    </View>
                  ))}
                </View>
              ))}
              {poemEdit ? null : null}
            </View>
          )}

          {/* 贴纸（可拖动，选中后可删除） */}
          {stickers.map((sk) => {
            const isSel = selectedId === sk.id
            return (
              <View
                key={sk.id}
                className={`photo-wrap ${isSel ? 'selected' : ''}`}
                style={{ left: `${sk.x}px`, top: `${sk.y}px`, width: '240rpx' }}
                catchMove
                onTouchStart={(e) => {
                  const t = e.touches[0]
                  setSelectedId(sk.id)
                  dragRef.current = { id: sk.id, startX: t.clientX, startY: t.clientY, baseX: sk.x, baseY: sk.y }
                }}
                onTouchMove={(e) => {
                  const d = dragRef.current
                  if (!d.id || d.id !== sk.id) return
                  const t = e.touches[0]
                  setStickers(prev => prev.map(p => p.id === d.id ? { ...p, x: d.baseX + (t.clientX - d.startX), y: d.baseY + (t.clientY - d.startY) } : p))
                }}
                onTouchEnd={() => { dragRef.current = { id: '', startX: 0, startY: 0, baseX: 0, baseY: 0 } }}
              >
                <Image className='photo-on-paper' src={sk.src} mode='widthFix' />
                {isSel && (
                  <View className='sticker-controls'>
                    <View className='sc-delete' catchMove onClick={() => {
                      setStickers(prev => prev.filter(p => p.id !== sk.id))
                      setSelectedId('')
                    }}>×</View>
                  </View>
                )}
              </View>
            )
          })}

          {/* 涂鸦层（全纸面，画在哪就在哪） */}
          {doodles.map((d) => (
            <Image key={d.id} className='doodle-on-paper' src={d.src} mode='widthFix' />
          ))}

          {/* 照片贴纸（白边 + 阴影，可选中拖动） */}
          {photos.map((ph) => (
            <View
              key={ph.id}
              className={`photo-wrap ${selectedId === ph.id ? 'selected' : ''}`}
              style={{ left: `${ph.x}px`, top: `${ph.y}px` }}
              catchMove
              onTouchStart={(e) => onStickerStart(ph.id, e)}
              onTouchMove={onStickerMove}
              onTouchEnd={onStickerEnd}
            >
              <Image className='photo-on-paper' src={ph.src} mode='widthFix' />
            </View>
          ))}

          {/* 书写文本（手写字体 + 随机歪斜，可拖） */}
          {texts.map((tx) => (
            editingTextId === tx.id ? (
              /* 编辑模式：透明输入框 + 实时歪斜预览（方案B） */
              <View key={tx.id} className='text-editing' style={{ left: `${tx.x}px`, top: `${tx.y}px` }}>
                <View className='tx-stack'>
                  <View className='tx-preview'>
                    {tx.chars.length === 0 ? (
                      <Text className='tx-placeholder'>随便码点字</Text>
                    ) : tx.chars.map((ch, i) => (
                      ch.c === '\n'
                        ? <View key={i} className='tx-br' />
                        : <Text key={i} className='tx-char' style={{ fontFamily: tx.family || 'inherit', transform: `rotate(${ch.r}deg) translateY(${ch.dy}rpx)`, fontSize: `${Math.round(40 * ch.s)}rpx` }}>{ch.c}</Text>
                    ))}
                  </View>
                  <Textarea
                    className='tx-input-invisible'
                    value={tx.text}
                    autoFocus
                    maxlength={-1}
                    onInput={(e) => onTextInput(tx.id, e.detail.value)}
                  />
                </View>
                <View className='tx-toolbar'>
                  <ScrollView scrollX className='tx-fontrow'>
                    <View className={`tx-font ${tx.family === '' ? 'on' : ''}`} onClick={() => setTexts(prev => prev.map(x => x.id === tx.id ? { ...x, family: '' } : x))}>默认</View>
                    {HAND_FONTS.map(f => (
                      <View key={f.family} className={`tx-font ${tx.family === f.family ? 'on' : ''}`} onClick={() => chooseFont(tx.id, f)}>{f.label}</View>
                    ))}
                  </ScrollView>
                  <View className='tx-ok' onClick={() => { if (!tx.text.trim()) { setTexts(prev => prev.filter(x => x.id !== tx.id)) } setEditingTextId('') }}>✓</View>
                </View>
              </View>
            ) : (
              /* 展示模式：歪斜手写字，点击重新编辑，可拖 */
              <View
                key={tx.id}
                className={`text-on-paper ${selectedId === tx.id ? 'selected' : ''}`}
                style={{ left: `${tx.x}px`, top: `${tx.y}px` }}
                catchMove
                onTouchStart={(e) => onTextStart(tx.id, e)}
                onTouchMove={onTextMove}
                onTouchEnd={onTextEnd}
                onClick={() => setEditingTextId(tx.id)}
              >
                {tx.chars.map((ch, i) => (
                  ch.c === '\n'
                    ? <View key={i} className='tx-br' />
                    : <Text
                        key={i}
                        className='tx-char'
                        style={{
                          fontFamily: tx.family || 'inherit',
                          transform: `rotate(${ch.r}deg) translateY(${ch.dy}rpx)`,
                          fontSize: `${Math.round(40 * ch.s)}rpx`
                        }}
                      >{ch.c}</Text>
                ))}
              </View>
            )
          ))}
        </View>
      </View>

      {/* 底部工具栏：白色圆角卡片 + 4 个实物图标（无文字） */}
      <View className='toolbar-card'>
        {bottomTools.map(t => (
          <View key={t.id} className={`tool ${t.cls} ${activeBottom === t.id ? 'tool-active' : ''}`} onClick={() => handleTool(t.id)}>
            <Image className='tool-icon' src={t.icon} mode='widthFix' />
          </View>
        ))}
      </View>

      {/* 拼贴诗编辑模式：顶部完成条 */}
      {poemEdit && (
        <View className='poem-edit-bar' style={{ top: `${statusBarHeight + 60}px` }}>
          <Text className='pe-hint'>拖动碎片调整位置</Text>
          <View className='pe-done' onClick={() => setPoemEdit(false)}>完成</View>
        </View>
      )}

      {/* 拼贴诗弹窗（只负责输入+生成，生成后贴到纸上） */}
      <CollageDialog
        open={collageOpen}
        onClose={() => { setCollageOpen(false); setActiveTop('') }}
        onGenerated={(p) => {
          setPoem(p)
          Taro.showToast({ title: '拼贴诗已贴上', icon: 'none' })
        }}
      />

      {/* 照片贴纸：选图→套索裁剪→白边贴纸 */}
      <PhotoSticker
        open={photoOpen}
        onClose={() => { setPhotoOpen(false); setActiveBottom('') }}
        onGenerated={(img) => setPhotos(prev => [...prev, { id: 'ph-' + Date.now(), src: img, x: 60, y: 180 }])}
      />

      {/* 涂鸦 */}
      <Doodle
        open={doodleOpen}
        statusBarHeight={statusBarHeight}
        onClose={() => { setDoodleOpen(false); setActiveBottom('') }}
        onGenerated={(img) => setDoodles(prev => [...prev, { id: 'dd-' + Date.now(), src: img }])}
      />
      {/* 贴纸弹窗 */}
      {stickerOpen && (
        <View className='sticker-mask' catchMove onClick={() => { setStickerOpen(false); setTimeout(() => setActiveTop(''), 200) }}>
          <View className='sticker-sheet' catchMove onClick={(e: any) => e.stopPropagation?.()}>
            <View className='ss-top'>
              <View className='ss-x' onClick={() => { setStickerOpen(false); setTimeout(() => setActiveTop(''), 200) }}>×</View>
            </View>
            <ScrollView scrollX className='ss-tabs'>
              {STICKER_CATS.map((cat, i) => (
                <View key={cat.label} className={`ss-tab ${activeStickerCat === i ? 'on' : ''}`} onClick={() => setActiveStickerCat(i)}>{cat.label}</View>
              ))}
            </ScrollView>
            <ScrollView scrollY className='ss-grid'>
              <View className='ss-row'>
                {STICKER_CATS[activeStickerCat].stickers.map((src, i) => (
                  <View key={i} className='ss-item' onClick={() => {
                    setStickers(prev => [...prev, { id: 'sk-' + Date.now(), src, x: 80, y: 200 }])
                  }}>
                    <Image className='ss-img' src={src} mode='aspectFill' />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}
