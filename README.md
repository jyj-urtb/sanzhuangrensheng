# 散装人生 · sanzhuangrensheng

反秩序手帐小程序 —— "人生乱套我睡觉，随便写点 ✍️"

拒绝精致、主打破碎/潦草/情绪化的手帐工具。核心 AI 功能「拼贴诗」：用户写日记 → DeepSeek 改造重组 → 渲染成报纸剪报式的碎片拼贴画。

## 技术栈

- **框架**：Taro 4 + React 18 + TypeScript（先出微信小程序，代码保留扩展为 App 的能力）
- **后端**：微信云开发（云函数中转大模型 + 云数据库存储 + 云存储托管字体/图片）
- **大模型**：DeepSeek V4（`deepseek-chat`，中文创意写作 + 极低成本）
- **字体处理**：fonttools 子集化 → woff 压缩 → 云存储动态加载

## 目录结构

```
src/
├── app.tsx / app.config.ts       # 入口 & 全局配置
├── pages/
│   ├── home/         日记首页（云数据库加载 + 纸条堆叠）
│   ├── editor/       笔记编辑页（核心，承载所有功能）
│   ├── calendar/     日历（数据驱动标记）
│   ├── create/       新建页（选纸张，已废弃改用弹窗）
│   ├── profile/      我的
│   └── trash/        删除小游戏
├── components/
│   ├── CalendarDrawer/   日历抽屉（从左滑出 + 日期标记 + 点击弹窗）
│   ├── CollageDialog/    拼贴诗弹窗（AI 生成 + 原文打散）
│   ├── PaperSheet/       选纸张弹窗（底部弹起）
│   ├── PhotoSticker/     照片贴纸（套索手撕裁剪 + 白边）
│   ├── Doodle/           涂鸦（压感毛笔 + 调色盘 + 撤回/橡皮擦）
│   ├── WriteText/        书写（备用）
│   └── StickerSheet/     贴纸库弹窗
├── services/deepseek.ts          # DeepSeek 调用（走云函数）
├── utils/collage.ts              # 拼贴诗碎片构建
├── constants/
│   ├── collageStyle.ts           # 拼贴诗样式常量
│   ├── fonts.ts                  # 云端字体清单
│   └── papers.ts                 # 纸张素材清单
└── assets/                       # 图片/字体/纹理/贴纸/笔刷

cloudfunctions/
├── deepseek/                     # DeepSeek 中转云函数（Key 走环境变量）
└── uploadfonts/                  # 一次性字体上传云函数
```

## 功能清单

- [x] **拼贴诗**：AI 散文诗生成 / 原文打散，碎片编辑，旧纸剪报风排版
- [x] **照片贴纸**：套索手撕裁剪 + 白边 + 可拖动
- [x] **手写文字**：12 种云端字体 + 实时歪斜效果 + 字体选择
- [x] **自由涂鸦**：压感笔刷（笔锋 + 粗细选择）+ 调色盘 + 撤回/橡皮擦
- [x] **贴纸库**：37 张，4 分类（古早炫彩/meme/千禧年/重磅推出）
- [x] **日历**：数据驱动标记（✓ 已写/○ 已删）+ 点击弹窗创建
- [x] **保存 & 加载**：云数据库存取日记，主页实时加载
- [x] **软删除**：日记删除后日历显示红圈
- [ ] 烧洞 / 手撕裁边（Canvas 硬骨头）
- [ ] 删除小游戏（纸团扔垃圾桶）
- [ ] 分享功能

## 本地运行

1. 安装依赖：`npm install`
2. 构建小程序：`npm run dev:weapp`
3. 用「微信开发者工具」打开本项目根目录
4. **开通云开发**：开发者工具顶部「云开发」→ 开通 → 记下环境 ID，填入 `src/app.tsx`
5. **部署云函数**：右键 `cloudfunctions/deepseek` → 上传并部署（云端安装依赖）
6. **配置 DeepSeek Key**：云开发控制台 → 云函数 deepseek → 环境变量 → 添加 `DEEPSEEK_API_KEY`
7. **字体上传**：部署 `cloudfunctions/uploadfonts`，云端测试调用一次，将字体上传至云存储

## 安全须知

- **DeepSeek API Key 只放在云函数环境变量**，绝不出现在前端代码或 git 里
- 小程序不能前端直连 DeepSeek，所有调用统一走 `deepseek` 云函数中转