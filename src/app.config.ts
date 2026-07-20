export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/collage/index',
    'pages/create/index',
    'pages/editor/index',
    'pages/calendar/index',
    'pages/profile/index',
    'pages/trash/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#f4efe4',
    navigationBarTitleText: '人生乱码',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8a8175',
    selectedColor: '#2b2620',
    backgroundColor: '#f4efe4',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/home/index', text: '日记' },
      { pagePath: 'pages/calendar/index', text: '日历' },
      { pagePath: 'pages/profile/index', text: '我的' }
    ]
  },
  // 云开发能力（DeepSeek 中转走云函数）
  cloud: true
})
