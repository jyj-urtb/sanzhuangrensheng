import { View, Text, Canvas } from '@tarojs/components'
import Taro, { useReady } from '@tarojs/taro'
import { useRef, useState } from 'react'
import './PhotoSticker.scss'

interface Props {
  open: boolean
  onClose: () => void
  onGenerated: (imgPath: string) => void
}

interface Pt { x: number; y: number }

const CANVAS_ID = 'photoCropCanvas'

export default function PhotoSticker({ open, onClose, onGenerated }: Props) {
  const [imgPath, setImgPath] = useState('')
  const [drawing, setDrawing] = useState(false)
  const [hasPath, setHasPath] = useState(false)
  const [busy, setBusy] = useState(false)
  const [dbg, setDbg] = useState('等待触摸…')

  const ctxRef = useRef<any>(null)
  const canvasRef = useRef<any>(null)
  const imgRef = useRef<any>(null)         // 画布上的图像对象
  const imgDrawRef = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const pathRef = useRef<Pt[]>([])
  const sizeRef = useRef({ w: 300, h: 380, dpr: 1 })
  const drawingRef = useRef(false)
  const rectRef = useRef({ left: 0, top: 0 })

  // 选照片
  const pickPhoto = async () => {
    try {
      const r = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] })
      const p = r.tempFilePaths[0]
      setImgPath(p)
      setHasPath(false)
      pathRef.current = []
      // 等 canvas ready 后画图
      setTimeout(() => initCanvas(p), 60)
    } catch (e) {
      // 用户取消
      if (!imgPath) onClose()
    }
  }

  const initCanvas = (p: string) => {
    const query = Taro.createSelectorQuery()
    query.select('#' + CANVAS_ID)
      .fields({ node: true, size: true, rect: true } as any)
      .exec((res: any) => {
        if (!res || !res[0]) return
        const canvas = res[0].node
        const w = res[0].width
        const h = res[0].height
        const dpr = (Taro.getWindowInfo?.().pixelRatio) || 2
        canvas.width = w * dpr
        canvas.height = h * dpr
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        ctxRef.current = ctx
        canvasRef.current = canvas
        sizeRef.current = { w, h, dpr }
        rectRef.current = { left: res[0].left || 0, top: res[0].top || 0 }

        const img = canvas.createImage()
        img.onload = () => {
          imgRef.current = img
          // 图铺满画布（cover），保证圈内总有照片内容、不会出现空白
          const scale = Math.max(w / img.width, h / img.height)
          const dw = img.width * scale
          const dh = img.height * scale
          const dx = (w - dw) / 2
          const dy = (h - dh) / 2
          imgDrawRef.current = { x: dx, y: dy, w: dw, h: dh }
          redraw()
        }
        img.src = p
      })
  }

  // 重绘：图 + 当前套索虚线
  const redraw = () => {
    const ctx = ctxRef.current
    const { w, h } = sizeRef.current
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    const d = imgDrawRef.current
    if (imgRef.current) ctx.drawImage(imgRef.current, d.x, d.y, d.w, d.h)
    const path = pathRef.current
    if (path.length > 1) {
      ctx.save()
      ctx.setLineDash([8, 6])
      ctx.lineWidth = 2
      ctx.strokeStyle = '#333'
      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y)
      ctx.stroke()
      ctx.restore()
    }
  }

  const getPt = (e: any): Pt => {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || {}
    // 优先用相对 canvas 的 x/y；拿不到就用 clientX - canvas偏移
    let x = (typeof t.x === 'number') ? t.x : ((t.clientX || 0) - rectRef.current.left)
    let y = (typeof t.y === 'number') ? t.y : ((t.clientY || 0) - rectRef.current.top)
    return { x, y }
  }

  const onTouchStart = (e: any) => {
    setDbg('start ' + JSON.stringify(e.touches && e.touches[0] ? { x: e.touches[0].x, y: e.touches[0].y } : 'no-touch'))
    if (!imgRef.current) { setDbg('start: 图未加载'); return }
    pathRef.current = [getPt(e)]
    drawingRef.current = true
    setDrawing(true)
  }
  const onTouchMove = (e: any) => {
    if (!drawingRef.current) { setDbg('move but not drawing'); return }
    const p = getPt(e)
    pathRef.current.push(p)
    setDbg('move pts=' + pathRef.current.length + ' @' + Math.round(p.x) + ',' + Math.round(p.y))
    redraw()
  }
  const onTouchEnd = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    setDrawing(false)
    if (pathRef.current.length > 3) setHasPath(true)
    setDbg('end pts=' + pathRef.current.length)
    redraw()
  }

  // 确认：裁剪圈内 + 白边描边 + 导出
  const confirm = async () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    const { w, h } = sizeRef.current
    const path = pathRef.current
    if (!ctx || !canvas || path.length < 4) {
      Taro.showToast({ title: '先画一个圈圈出保留区', icon: 'none' })
      return
    }
    setBusy(true)
    try {
      // 1. 先画白色底形（整个套索形状 + 阴影）——作为贴纸白底
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y)
      ctx.closePath()
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.25)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 3
      ctx.fill()
      // 描一圈外扩白边，保证边缘也有白底
      ctx.shadowColor = 'transparent'
      ctx.lineWidth = 10
      ctx.strokeStyle = '#ffffff'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()

      // 2. 把套索路径向中心内缩一圈（图比白底小，四周都露白边）
      let cx = 0, cy = 0
      for (const p of path) { cx += p.x; cy += p.y }
      cx /= path.length; cy /= path.length
      const inset = 7   // 白边宽度
      const innerPath = path.map(p => {
        const dx = p.x - cx, dy = p.y - cy
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const k = Math.max(0, (len - inset)) / len
        return { x: cx + dx * k, y: cy + dy * k }
      })

      // 3. 在内缩路径内裁剪，画图
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(innerPath[0].x, innerPath[0].y)
      for (let i = 1; i < innerPath.length; i++) ctx.lineTo(innerPath[i].x, innerPath[i].y)
      ctx.closePath()
      ctx.clip()
      const d = imgDrawRef.current
      ctx.drawImage(imgRef.current, d.x, d.y, d.w, d.h)
      ctx.restore()

      // 3. 导出成图片
      const r = await Taro.canvasToTempFilePath({ canvas } as any)
      onGenerated(r.tempFilePath)
      reset()
      onClose()
    } catch (e: any) {
      Taro.showModal({ title: '裁剪失败', content: e.message || String(e), showCancel: false })
    } finally {
      setBusy(false)
    }
  }

  const undo = () => {
    pathRef.current = []
    setHasPath(false)
    redraw()
  }

  const reset = () => {
    setImgPath('')
    setHasPath(false)
    pathRef.current = []
  }

  // 打开时自动拉起选图
  useReady(() => {
    if (open && !imgPath) pickPhoto()
  })

  if (!open) return null

  return (
    <View className='photo-sticker-mask'>
      <View className='ps-top'>
        <View className='ps-back' onClick={() => { reset(); onClose() }}>‹</View>
      </View>

      <View className='ps-stage'>
        {imgPath ? (
          <Canvas
            type='2d'
            id={CANVAS_ID}
            className='ps-canvas'
            disableScroll
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        ) : (
          <View className='ps-pick' onClick={pickPhoto}>＋ 选择照片</View>
        )}
      </View>

      <View className='ps-tip'>手指滑动，圈出要保留的部分</View>

      {/* 底部工具栏：重画 / 换图 / ✓确认 */}
      {imgPath ? (
        <View className='ps-bottom'>
          <Text className='ps-tool' onClick={undo}>↶</Text>
          <Text className='ps-tool' onClick={pickPhoto}>⇄</Text>
          <View className={`ps-confirm ${busy ? 'busy' : ''}`} onClick={confirm}>✓</View>
        </View>
      ) : null}
    </View>
  )
}
