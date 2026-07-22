import { View, Canvas, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRef, useState, useEffect } from 'react'
import './Doodle.scss'
import eraserIcon from '../assets/icons/eraser.png'
import undoIcon from '../assets/icons/undo.png'
import doneIcon from '../assets/icons/done.png'

interface Props {
  open: boolean
  statusBarHeight: number
  onClose: () => void
  onGenerated: (imgPath: string) => void
}

const PRESET = ['#f4c95d', '#e5484d', '#5fbf7f', '#2b2620', '#3a7bd5', '#ffffff', '#e88fb0']
const DRAW_ID = 'doodleCanvas'
const PAL_ID = 'paletteCanvas'

export default function Doodle({ open, statusBarHeight, onClose, onGenerated }: Props) {
  const [color, setColor] = useState('#2b2620')
  const [showPalette, setShowPalette] = useState(false)
  const [busy, setBusy] = useState(false)
  const [eraser, setEraser] = useState(false)
  const [brushSize, setBrushSize] = useState(2)

  const drawCtxRef = useRef<any>(null)
  const drawCanvasRef = useRef<any>(null)
  const drawingRef = useRef(false)
  const sizeRef = useRef({ w: 300, h: 400 })
  const colorRef = useRef('#2b2620')
  const lastRef = useRef({ x: 0, y: 0, w: 8 })
  const eraserRef = useRef(false)
  // 笔画历史（撤回用）：每笔 = {color, eraser, points:[{x,y,w}]}
  const strokesRef = useRef<any[]>([])
  const curStrokeRef = useRef<any>(null)
  const tipImgRef = useRef<any>(null)
  const grainImgRef = useRef<any>(null)

  const initDraw = () => {
    const q = Taro.createSelectorQuery()
    q.select('#' + DRAW_ID).fields({ node: true, size: true } as any).exec((res: any) => {
      if (!res || !res[0]) return
      const canvas = res[0].node
      const w = res[0].width, h = res[0].height
      const dpr = (Taro.getWindowInfo?.().pixelRatio) || 2
      canvas.width = w * dpr; canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      drawCtxRef.current = ctx
      drawCanvasRef.current = canvas
      sizeRef.current = { w, h }

      // 加载笔刷形状
      const tip = canvas.createImage()
      tip.onload = () => { tipImgRef.current = tip }
      tip.src = brushTip

      // 加载颗粒纹理
      const grain = canvas.createImage()
      grain.onload = () => { grainImgRef.current = grain }
      grain.src = brushGrain
    })
  }

  Taro.useReady(() => { if (open) setTimeout(initDraw, 80) })
  // 每次打开都重新初始化画布
  useEffect(() => {
    if (open) setTimeout(initDraw, 120)
  }, [open])

  const onStart = (e: any) => {
    const ctx = drawCtxRef.current; if (!ctx) return
    const t = e.touches[0]
    drawingRef.current = true
    curStrokeRef.current = { color: colorRef.current, eraser: eraserRef.current, points: [{ x: t.x, y: t.y, w: 1 }] }
    
    // 起笔：从极细的笔尖开始
    if (!eraserRef.current) {
      lastRef.current = { x: t.x, y: t.y, w: 1 }
    } else {
      lastRef.current = { x: t.x, y: t.y, w: 30 }
    }
  }
  const onMove = (e: any) => {
    if (!drawingRef.current) return
    const ctx = drawCtxRef.current; const t = e.touches[0]
    const last = lastRef.current
    const dx = t.x - last.x, dy = t.y - last.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 0.5) return
    const speed = dist
    const pressure = eraserRef.current ? 1 : Math.min(1, 8 / (speed + 4))
    const targetW = eraserRef.current ? 36 : (brushSize + pressure * (brushSize * 5))
    const w = last.w + (targetW - last.w) * 0.15
    ctx.save()
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.lineWidth = w
    if (eraserRef.current) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.quadraticCurveTo((last.x + t.x) / 2, (last.y + t.y) / 2, t.x, t.y)
      ctx.stroke()
    } else {
      // 流畅线条 + 笔锋
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = colorRef.current
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.quadraticCurveTo((last.x + t.x) / 2, (last.y + t.y) / 2, t.x, t.y)
      ctx.stroke()
    }
    ctx.restore()
    lastRef.current = { x: t.x, y: t.y, w }
    if (curStrokeRef.current) curStrokeRef.current.points.push({ x: t.x, y: t.y, w })
  }
  const onEnd = () => {
    // 收笔：沿着笔画方向逐渐变细，形成尖锐笔尖
    if (!eraserRef.current && curStrokeRef.current && curStrokeRef.current.points.length > 2) {
      const ctx = drawCtxRef.current
      const points = curStrokeRef.current.points
      const last = points[points.length - 1]
      const prev = points[points.length - 2]
      const dx = last.x - prev.x
      const dy = last.y - prev.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 0.1) {
        ctx.save()
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = colorRef.current
        // 6 步逐渐变细，形成尖锐笔尖
        for (let i = 0; i < 6; i++) {
          const t = (i + 1) / 6
          const x = last.x + (dx / len) * i * 4
          const y = last.y + (dy / len) * i * 4
          const radius = last.w * 0.5 * Math.pow(1 - t, 2)
          if (radius > 0.2) {
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.restore()
      }
    }
    
    drawingRef.current = false
    if (curStrokeRef.current && curStrokeRef.current.points.length > 1) {
      strokesRef.current.push(curStrokeRef.current)
    }
    curStrokeRef.current = null
  }

  // 重绘全部笔画（撤回后用）
  const redrawAll = () => {
    const ctx = drawCtxRef.current; const { w, h } = sizeRef.current
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    for (const st of strokesRef.current) {
      ctx.save()
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      if (st.eraser) { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = 'rgba(0,0,0,1)' }
      else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = st.color }
      for (let i = 1; i < st.points.length; i++) {
        ctx.lineWidth = st.points[i].w
        ctx.beginPath()
        ctx.moveTo(st.points[i - 1].x, st.points[i - 1].y)
        ctx.lineTo(st.points[i].x, st.points[i].y)
        ctx.stroke()
      }
      ctx.restore()
      
      // 添加起笔尖
      if (!st.eraser && st.points.length >= 2) {
        const first = st.points[0]
        const second = st.points[1]
        const dx = second.x - first.x
        const dy = second.y - first.y
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len > 0.1) {
          ctx.save()
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = st.color
          for (let i = 0; i < 4; i++) {
            const t = (i + 1) / 4
            const x = first.x - (dx / len) * i * 3
            const y = first.y - (dy / len) * i * 3
            const radius = first.w * (1 - t) * 0.5
            if (radius > 0.3) {
              ctx.beginPath()
              ctx.arc(x, y, radius, 0, Math.PI * 2)
              ctx.fill()
            }
          }
          ctx.restore()
        }
      }
      
      // 添加收笔尖
      if (!st.eraser && st.points.length > 2) {
        const last = st.points[st.points.length - 1]
        const prev = st.points[st.points.length - 2]
        const dx = last.x - prev.x
        const dy = last.y - prev.y
        const len = Math.sqrt(dx * dx + dy * dy)
        if (len > 0.1) {
          ctx.save()
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = st.color
          for (let i = 0; i < 4; i++) {
            const t = (i + 1) / 4
            const x = last.x + (dx / len) * i * 3
            const y = last.y + (dy / len) * i * 3
            const radius = last.w * (1 - t) * 0.5
            if (radius > 0.3) {
              ctx.beginPath()
              ctx.arc(x, y, radius, 0, Math.PI * 2)
              ctx.fill()
            }
          }
          ctx.restore()
        }
      }
    }
  }
  const undo = () => {
    strokesRef.current.pop()
    redrawAll()
  }

  const pickColor = (c: string) => { setColor(c); colorRef.current = c; setEraser(false); eraserRef.current = false }
  const toggleEraser = () => { const v = !eraserRef.current; eraserRef.current = v; setEraser(v) }

  // 调色盘：点开时画一张 色相×明度 的取色图
  const initPalette = () => {
    const q = Taro.createSelectorQuery()
    q.select('#' + PAL_ID).fields({ node: true, size: true } as any).exec((res: any) => {
      if (!res || !res[0]) return
      const canvas = res[0].node
      const w = res[0].width, h = res[0].height
      const dpr = (Taro.getWindowInfo?.().pixelRatio) || 2
      canvas.width = w * dpr; canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      // 横向色相
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      const hues = ['#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ff0000']
      hues.forEach((c, i) => grad.addColorStop(i / (hues.length - 1), c))
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
      // 纵向：上白下黑（叠加明度）
      const g2 = ctx.createLinearGradient(0, 0, 0, h)
      g2.addColorStop(0, 'rgba(255,255,255,1)')
      g2.addColorStop(0.5, 'rgba(255,255,255,0)')
      g2.addColorStop(0.5, 'rgba(0,0,0,0)')
      g2.addColorStop(1, 'rgba(0,0,0,1)')
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h)
      ;(canvas as any)._ctx = ctx
      ;(canvas as any)._w = w; (canvas as any)._h = h
      palCanvasRef.current = canvas
    })
  }
  const palCanvasRef = useRef<any>(null)
  const openPalette = () => { setShowPalette(true); setTimeout(initPalette, 60) }
  const onPalTap = (e: any) => {
    const canvas = palCanvasRef.current; if (!canvas) return
    const t = e.touches[0]
    const dpr = (Taro.getWindowInfo?.().pixelRatio) || 2
    const data = canvas._ctx.getImageData(t.x * dpr, t.y * dpr, 1, 1).data
    const c = `rgb(${data[0]},${data[1]},${data[2]})`
    pickColor(c)
  }

  const confirm = async () => {
    const canvas = drawCanvasRef.current
    if (!canvas) { onClose(); return }
    setBusy(true)
    try {
      const r = await Taro.canvasToTempFilePath({ canvas } as any)
      onGenerated(r.tempFilePath)
      onClose()
    } catch (e: any) {
      Taro.showModal({ title: '\u4fdd\u5b58\u5931\u8d25', content: e.message || String(e), showCancel: false })
    } finally { setBusy(false) }
  }

  if (!open) return null

  return (
    <View className='doodle-layer'>
      {/* 顶部颜色条 */}
      <View className='dd-colorbar' style={{ top: `${statusBarHeight + 100}px` }}>
        {PRESET.map(c => (
          <View
            key={c}
            className={`dd-color ${color === c ? 'on' : ''}`}
            style={{ background: c }}
            onClick={() => pickColor(c)}
          />
        ))}
        <View className='dd-color rainbow' onClick={openPalette} />
      </View>

      {/* 底部右：撤回 / 橡皮擦 / 完成 */}
      <View className='dd-actions'>
        <View className='dd-btn' catchMove onClick={undo}>
          <Image src={undoIcon} className='btn-icon' mode='aspectFit' />
        </View>
        <View className={`dd-btn ${eraser ? 'on' : ''}`} onClick={toggleEraser}>
          <Image src={eraserIcon} className='btn-icon' mode='aspectFit' />
        </View>
        <View className='dd-btn done' catchMove onClick={confirm}>
          <Image src={doneIcon} className='btn-icon' mode='aspectFit' />
        </View>
      </View>

      {/* 粗细选择 */}
      <View className='dd-sizes'>
        {[1, 2, 3, 5, 7].map(s => (
          <View key={s} className={`dd-sz ${brushSize === s ? 'on' : ''}`} onClick={() => setBrushSize(s)}>
            <View className='sz-dot' style={{ width: `${s * 8}rpx`, height: `${s * 8}rpx` }} />
          </View>
        ))}
      </View>

      {/* 涂鸦画布（透明，盖在纸上） */}
      <Canvas
        type='2d'
        id={DRAW_ID}
        className='dd-canvas'
        disableScroll
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      />

      {/* 调色盘弹窗 */}
      {showPalette && (
        <View className='dd-palette-mask' onClick={() => setShowPalette(false)}>
          <View className='dd-palette' catchMove>
            <Canvas type='2d' id={PAL_ID} className='pal-canvas' disableScroll onTouchStart={onPalTap} onTouchMove={onPalTap} />
            <View className='pal-bottom'>
              <View className='pal-preview' style={{ background: color }} />
              <View className='pal-ok' onClick={() => setShowPalette(false)}>确定</View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
