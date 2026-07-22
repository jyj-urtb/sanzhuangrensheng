import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import checkIcon from '../assets/calendar/check.png'
import circleIcon from '../assets/calendar/circle.png'
import './CalendarDrawer.scss'

const MONTH_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface DayCell {
  day: number
  mark?: 'check' | 'circle'
}

function buildMonth(year: number, month: number, marks: Record<number, 'check' | 'circle'>): (DayCell | null)[] {
  const first = new Date(year, month - 1, 1)
  let startOffset = first.getDay() - 1
  if (startOffset < 0) startOffset = 6
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (DayCell | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, mark: marks[d] })
  return cells
}

interface DiaryEntry {
  _id: string
  createdAt: any
  deleted?: boolean
}

interface Props {
  open: boolean
  statusBarHeight: number
  onClose: () => void
}

export default function CalendarDrawer({ open, statusBarHeight, onClose }: Props) {
  const [marksByMonth, setMarksByMonth] = useState<Record<string, Record<number, 'check' | 'circle'>>>({})
  const [promptDate, setPromptDate] = useState<{ year: number; month: number; day: number } | null>(null)

  useEffect(() => {
    if (open) loadDiaryMarks()
  }, [open])

  const loadDiaryMarks = async () => {
    try {
      const db = Taro.cloud.database()
      const res = await db.collection('diary_entries').orderBy('createdAt', 'desc').limit(1000).get()
      const entries = res.data as DiaryEntry[]
      const marks: Record<string, Record<number, 'check' | 'circle'>> = {}
      entries.forEach(entry => {
        if (!entry.createdAt) return
        const date = new Date(entry.createdAt)
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`
        if (!marks[key]) marks[key] = {}
        if (!entry.deleted) marks[key][date.getDate()] = 'check'
        else if (marks[key][date.getDate()] !== 'check') marks[key][date.getDate()] = 'circle'
      })
      setMarksByMonth(marks)
    } catch (e) { console.error(e) }
  }

  const handleDayClick = (year: number, month: number, day: number, mark?: 'check' | 'circle') => {
    if (mark) return
    setPromptDate({ year, month, day })
  }

  const handleComeOn = () => {
    if (!promptDate) return
    const { year, month, day } = promptDate
    setPromptDate(null)
    onClose()
    setTimeout(() => {
      Taro.navigateTo({ url: `/pages/editor/index?date=${year}-${month}-${day}` })
    }, 200)
  }

  const handleLater = () => {
    setPromptDate(null)
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const monthsToShow: { year: number, month: number }[] = []
  for (let i = 0; i < 12; i++) {
    let month = currentMonth - i
    let year = currentYear
    if (month <= 0) { month += 12; year -= 1 }
    monthsToShow.push({ year, month })
  }

  return (
    <>
      <View className={`cal-drawer ${open ? 'open' : ''}`}>
        <ScrollView scrollY className='cal-scroll' style={{ paddingTop: `${statusBarHeight + 30}px` }}>
          <View className='header'>
            <View className='title-wrap'>
              <Text className='big-title'>人生乱套，我睡觉</Text>
              <Text className='sub-title'>随便写点 ✍️</Text>
            </View>
            <Text className='close-arrow' onClick={onClose}>›</Text>
          </View>
          {monthsToShow.map(({ year, month }) => {
            const key = `${year}-${month}`
            const cells = buildMonth(year, month, marksByMonth[key] || {})
            return (
              <View key={key} className='month-block'>
                <Text className='month-en'>{MONTH_EN[month - 1]}</Text>
                <Text className='month-num'>{year}/{month < 10 ? '0' + month : month}</Text>
                <View className='week-row'>
                  {WEEK.map((w, i) => (
                    <Text key={w} className={`week-cell ${i >= 5 ? 'weekend' : ''}`}>{w}</Text>
                  ))}
                </View>
                <View className='days-grid'>
                  {cells.map((c, idx) => {
                    const isWeekend = (idx % 7) >= 5
                    return (
                      <View key={idx} className='day-cell'>
                        {c && (
                          <View className='day-inner' onClick={() => handleDayClick(year, month, c.day, c.mark)}>
                            <Text className={`day-num ${isWeekend ? 'weekend' : ''}`}>{c.day}</Text>
                            {c.mark === 'check' && <Image className='mark check' src={checkIcon} mode='widthFix' />}
                            {c.mark === 'circle' && <Image className='mark circle' src={circleIcon} mode='widthFix' />}
                          </View>
                        )}
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })}
          <View className='bottom-space' />
        </ScrollView>
      </View>

      {/* 弹窗：独立在日历外，防止渲染冲突 */}
      {promptDate && (
        <View className='cal-prompt-mask' catchMove>
          <View className='cal-prompt' catchMove>
            <Text className='prompt-text'>
              {promptDate.month}月{promptDate.day}日还没有记录，{'\n'}快来码上吧 👀
            </Text>
            <View className='prompt-btns'>
              <View className='prompt-btn later' onClick={handleLater}>
                <Text>下次再说</Text>
              </View>
              <View className='prompt-btn come' onClick={handleComeOn}>
                <Text>来了来了</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  )
}