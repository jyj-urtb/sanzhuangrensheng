import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import checkIcon from '../../assets/calendar/check.png'
import circleIcon from '../../assets/calendar/circle.png'
import { PAPERS } from '../../constants/papers'
import './index.scss'

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

export default function Calendar() {
  const [statusBarHeight, setStatusBarHeight] = useState(20)
  useLoad(() => {
    const info = Taro.getWindowInfo?.() || Taro.getSystemInfoSync()
    setStatusBarHeight(info.statusBarHeight || 20)
  })

  const year = 2027
  const monthsToShow = [7, 6, 5, 4, 3, 2, 1]
  const demoMarks: Record<number, Record<number, 'check' | 'circle'>> = {
    7: { 1: 'check', 2: 'check', 24: 'check' },
    6: { 8: 'circle', 16: 'check' },
    5: { 6: 'circle', 16: 'check', 21: 'check' }
  }

  // 点 › 或右侧缝隙 → 返回首页
  const backHome = () => Taro.navigateBack()

  return (
    <View className='calendar-page'>
      {/* 左侧日历面板（约 85% 宽） */}
      <View className='cal-panel'>
        <ScrollView scrollY className='cal-scroll' style={{ paddingTop: `${statusBarHeight + 30}px` }}>
          {/* 标题 + 右箭头返回 */}
          <View className='header'>
            <View className='title-wrap'>
              <Text className='big-title'>人生乱套，我睡觉</Text>
              <Text className='sub-title'>随便写点 ✍️</Text>
            </View>
            <Text className='close-arrow' onClick={backHome}>›</Text>
          </View>

          {monthsToShow.map(m => {
            const cells = buildMonth(year, m, demoMarks[m] || {})
            return (
              <View key={m} className='month-block'>
                <Text className='month-en'>{MONTH_EN[m - 1]}</Text>
                <Text className='month-num'>{year}/{m}</Text>

                <View className='week-row'>
                  {WEEK.map((w, i) => (
                    <Text key={w} className={`week-cell ${i >= 5 ? 'weekend' : ''}`}>{w}</Text>
                  ))}
                </View>

                <View className='days-grid'>
                  {cells.map((c, idx) => {
                    const col = idx % 7
                    const isWeekend = col >= 5
                    return (
                      <View key={idx} className='day-cell'>
                        {c && (
                          <View className='day-inner'>
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

      {/* 右侧窄缝：露出首页纸条（灰暗），点击也返回 */}
      <View className='right-peek' onClick={backHome}>
        <View className='peek-avatar' style={{ marginTop: `${statusBarHeight + 20}px` }}>
          <View className='avatar-head' />
          <View className='avatar-body' />
        </View>
        <View className='peek-strips'>
          {[PAPERS[0], PAPERS[7], PAPERS[10], PAPERS[3]].map((p, i) => (
            <Image key={i} className='peek-strip' src={p.src} mode='aspectFill' />
          ))}
        </View>
      </View>
    </View>
  )
}
