export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/editor/index',
    'pages/profile/index',
    'pages/trash/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom'  // 自定义导航（首页要放 ☰ 和 👤）
  },
  // 云开发能力（DeepSeek 中转走云函数）
  cloud: true
})
