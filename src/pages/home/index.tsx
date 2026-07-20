import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Home() {
  return (
    <View className='home-page'>
      <Text className='slogan'>人生乱套我睡觉，随便写点 ✍️</Text>
      <View className='card-list'>
        {/* P1：日记卡片流将在此渲染（不同纸张纹理） */}
        <View className='empty-tip'>还没有记录，点下面➕开始乱写</View>
      </View>

      {/* 新建：先直达拼贴诗（P0 已完成）；P1 会接入选纸张流程 */}
      <Button
        className='add-btn paper-shadow'
        onClick={() => Taro.navigateTo({ url: '/pages/collage/index' })}
      >
        ＋
      </Button>
    </View>
  )
}
