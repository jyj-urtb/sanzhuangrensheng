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

  useLoad(() => {
    const info = Taro.getWindowInfo?.() || Taro.getSystemInfoSync()
    setStatusBarHeight(info.statusBarHeight || 20)
    const paperId = router.params.paper
    if (paperId) {
      const p = getPaperById(paperId)
      if (p) setPaperSrc(p.src)
    }
  })

  const bottomTools = [
    { id: 'paint', icon: iconPaint, cls: 'tool-paint' },
    { id: 'photo', icon: iconPhoto, cls: 'tool-photo' },
    { id: 'write', icon: iconPen, cls: 'tool-pen' },
    { id: 'burn', icon: iconMatch, cls: 'tool-match' }
  ]

  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    switch (action) {
      case 'save':
        Taro.showToast({ title: '保存功能开发中', icon: 'none' })
        break
      case 'delete':
        Taro.showModal({
          title: '确认删除',
          content: '删除后无法恢复，确定要删除吗？',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateBack()
            }
          }
        })
        break
      case 'share':
        Taro.showToast({ title: '分享功能开发中', icon: 'none' })
        break
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
      Taro.showToast({ title: '贴画开发中', icon: 'none' })
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
        <View className='canvas-wrap'>
          <Image className='canvas-paper' src={paperSrc} mode='aspectFill' />

          {poem && (
            <View
              className={`poem-layer ${poemEdit ? 'editing' : ''}`}
              onClick={() => { if (!poemEdit) setPoemEdit(true) }}
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
        <View className='poem-edit-bar' style={{ top: `${statusBarHeight + 12}px` }}>
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
    </View>
  )
}
