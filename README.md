# SmartHair AI · 智能发型设计系统

> AI + AR 驱动的智能发型设计系统高转化率产品落地页

面向美发行业 B2B/B2C 客户的产品展示页面，以「未来科技感」为核心视觉语言，完整呈现 SmartHair AI 的技术架构、核心功能、商业模式与互动体验。

---

## 项目简介

SmartHair AI 是一套基于 6 层架构的智能发型设计系统，融合 AI 脸型发质分析、加权匹配推荐算法与 AR 多角度虚拟试戴技术。本落地页面向美发沙龙经营者和终端消费者，通过沉浸式视觉体验传递产品价值，驱动咨询转化。

### 页面结构（9 大区块）

| # | 区块 | 文件 | 功能 |
|---|------|------|------|
| 1 | Navbar | `sections/Navbar.tsx` | 玻璃态导航栏 + 移动端汉堡菜单 |
| 2 | Hero | `sections/Hero.tsx` | 首屏渐变标题 + AR 预览手机模型 |
| 3 | PainVsSolution | `sections/PainVsSolution.tsx` | 4 大痛点 ↔ 4 大方案联动展示 |
| 4 | Architecture | `sections/Architecture.tsx` | 智能镜面横幅 + 6 层架构展开 |
| 5 | FeatureDemo | `sections/FeatureDemo.tsx` | 3 Tab 功能演示（推荐/试戴/施工参数）|
| 6 | DemoSection | `sections/DemoSection.tsx` | 互动体验：选脸型发质 → AI 推荐 → AR 试戴 |
| 7 | BusinessModel | `sections/BusinessModel.tsx` | B2B/B2C 对比 + 定价表 + 案例展示 |
| 8 | ContactForm | `sections/ContactForm.tsx` | 商家咨询表单 |
| 9 | Footer | `sections/Footer.tsx` | 隐私合规徽章 + 链接 + 返回顶部 |

所有内容数据集中在 `src/data/content.ts`，便于维护和更新。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19.2 |
| 构建工具 | Vite | 7.2 |
| 样式 | Tailwind CSS | 4.1 |
| 动画 | Framer Motion | 12.26 |
| 图标 | Lucide React | 0.554 |
| UI 组件 | Radix UI + shadcn/ui | - |
| 语言 | TypeScript | 5.9 |
| 路径别名 | `@/` → `src/` | vite.config.ts |

---

## 关键优化记录

### 1. 无障碍模式支持（`prefers-reduced-motion`）
- **Hero 区块**：手机模型 3 视角自动轮播在 `prefers-reduced-motion: reduce` 时停止
- **FeatureDemo 区块**：AnimatedNumber 评分动画（92%）在无障碍模式下直接显示终值，跳过 800ms 计数动画
- **AR 试戴预览**：3.5s 自动切换在无障碍模式下禁用
- **全局 CSS**：`@media (prefers-reduced-motion: reduce)` 禁用 float、pulse-glow、gradient-shift 等所有装饰性动画

### 2. 文案转化率优化
- Hero 副标题：「3 秒读懂你的脸型与发质，AR 多角度预览剪发效果，连理发师都照着施工 — 再也不用赌运气。」— 用具体数字和场景化描述替代抽象宣传
- Hero CTA：「预约方案演示」替代通用「了解更多」，直接对应 `#contact` 表单
- PainVsSolution 标题：「告别凭感觉 / 四大理发痛点，一次解决」— 痛点+承诺结构
- Footer CTA：「免费获取部署方案」降低咨询门槛

### 3. 图标系统重构
- 4 个组件（Architecture / FeatureDemo / BusinessModel / PainVsSolution）从 `import * as Icons` 动态查找重构为**显式命名导入 + `iconMap` Record 映射**
- 消除了运行时动态属性查找的安全隐患，TypeScript 类型检查完整覆盖
- 统一了 `iconMap: Record<string, React.ComponentType>` 模式，数据文件中用字符串引用图标名，组件层做映射

### 4. 视觉与交互优化
- **图片加载体验**：Architecture 横幅使用 `animate-pulse` 骨架屏占位 + `onLoad` 渐显，配合 `aspect-[21/9]` 固定比例防止布局偏移
- **滚动触发动画**：AnimatedNumber 使用 `IntersectionObserver`，threshold 0.3，元素进入视口时触发计数
- **配色系统**：OKLCH 色彩空间，CSS 自定义属性管理 `--neon-purple` / `--neon-cyan` / `--neon-pink`，紫青交替增强层次感
- **移动端适配**：手机模型宽度响应式 `w-[240px] md:w-[300px]`，375px 视口验证通过

### 5. 代码质量
- `console.log` 零残留（仅保留 NotFound 和 api-client 中 3 处 `console.error` 错误日志）
- 所有 `alt` 标签均为描述性文字（如「女性发型推荐案例 — 韩系中长碎发」）
- 所有组件使用显式导入，无 `import *` 通配符

---

## 项目结构

```
frontend/
├── src/
│   ├── data/
│   │   └── content.ts          # 全站内容数据（集中管理）
│   ├── sections/               # 9 大区块组件
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── PainVsSolution.tsx
│   │   ├── Architecture.tsx
│   │   ├── FeatureDemo.tsx
│   │   ├── DemoSection.tsx
│   │   ├── BusinessModel.tsx
│   │   ├── ContactForm.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   └── Index.tsx           # 页面组合
│   ├── assets/
│   │   └── images/             # AI 生成的产品图片（4 张）
│   ├── index.css               # 设计系统（OKLCH + 动画 + 无障碍）
│   └── App.tsx                 # 应用入口
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 启动与构建

### 环境要求
- Node.js >= 18
- pnpm >= 10

### 安装依赖
```bash
cd frontend
pnpm install
```

### 开发模式
```bash
pnpm dev
```
开发服务器运行在 `http://localhost:5173`，API 请求代理到 `http://localhost:3000`。

### 生产构建
```bash
pnpm build
```
输出到 `frontend/dist/`，包含 TypeScript 类型检查 + Vite 生产构建。

### 预览构建产物
```bash
pnpm preview
```

### 代码检查
```bash
pnpm lint
```

---

## 设计系统

- **主色调**：深空黑 `oklch(0.12 0.005 280)` 背景 + 霓虹紫 `oklch(0.65 0.25 300)` / 霓虹青 `oklch(0.75 0.18 200)` 渐变
- **卡片**：玻璃态 `backdrop-blur` + 半透明边框
- **按钮**：渐变填充 + glow 阴影悬停效果
- **背景**：网格底纹 + 径向渐变叠加
- **字体**：系统无衬线字体栈
- **动画**：float 浮动、pulse-glow 脉冲发光、gradient-shift 渐变流动、scan-line 扫描线

---

## License

Private - SmartHair AI Team
