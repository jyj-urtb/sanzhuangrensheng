# 散装人生 · sanzhuangrensheng

反秩序手帐小程序 —— "人生乱套我睡觉，随便写点 ✍️"

拒绝精致、主打破碎/潦草/情绪化的手帐工具。核心 AI 功能「拼贴诗」：用户写日记 → DeepSeek 改造重组 → 渲染成报纸剪报式的碎片拼贴画。

## 技术栈

- **框架**：Taro 4 + React + TypeScript（跨端，先出微信小程序，代码保留扩展为 App 的能力）
- **后端**：微信云开发（云函数中转 DeepSeek + 后续数据/图片存储）
- **大模型**：DeepSeek（`deepseek-chat`）

## 目录结构（分页面 / 分模块，方便单独修改）

```
src/
├── app.tsx / app.config.ts     # 入口 & 全局配置（路由、tabBar、云开发）
├── pages/                      # 每个界面一个文件夹
│   ├── home/       日记首页
│   ├── collage/    ★ 拼贴诗（P0，已完成：输入→DeepSeek→碎片渲染）
│   ├── create/     新建页（选纸张，P1）
│   ├── editor/     笔记编辑页（P1）
│   ├── calendar/   日历（P2）
│   ├── profile/    我的（P1）
│   └── trash/      删除小游戏（P2）
├── components/                 # 可复用组件
├── services/deepseek.ts        # DeepSeek 调用（走云函数）
├── utils/collage.ts            # 文本打碎 + 碎片随机样式
├── constants/collageStyle.ts   # 字体/底色/角度等样式常量
└── assets/                     # 图片/字体素材

cloudfunctions/
└── deepseek/                   # DeepSeek 中转云函数（Key 走环境变量）
```

## 开发进度

- [x] **P0 拼贴诗**：输入标题+正文 → DeepSeek 生成碎片 → 可拖拽的拼贴画渲染
- [ ] P1：首页卡片流 / 选纸张 / 书写编辑 / 我的
- [ ] P2：日历 / 删除小游戏
- [ ] P3：烧洞 / 手撕裁边 / 涂鸦（Canvas 硬骨头，接受简化）

## 本地运行

1. 安装依赖：`npm install`
2. 构建小程序：`npm run dev:weapp`
3. 用「微信开发者工具」打开本项目根目录（AppID 已配置在 `project.config.json`）
4. **开通云开发**：开发者工具顶部「云开发」→ 开通 → 记下环境 ID，填入 `src/app.tsx` 的 `Taro.cloud.init({ env: '...' })`
5. **部署云函数**：右键 `cloudfunctions/deepseek` → 上传并部署
6. **配置 DeepSeek Key**：云开发控制台 → 云函数 deepseek → 环境变量 → 添加 `DEEPSEEK_API_KEY`（你自己的 key，绝不写进代码）

## 安全须知

- **DeepSeek API Key 只放在云函数环境变量**，绝不出现在前端代码或 git 里。
- 小程序不能前端直连 DeepSeek，所有调用统一走 `deepseek` 云函数中转。
