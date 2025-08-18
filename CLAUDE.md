# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
"快乐健"是一款基于Web平台的健身应用（PWA），旨在帮助用户创建和管理自定义健身项目，提供实时跟踪和多维度提醒功能。所有数据存储在浏览器本地，无需后端服务器。

## 技术栈
- 平台：Web (PWA)
- 语言：JavaScript/TypeScript
- 框架：React.js
- 构建工具：Vite
- 样式框架：Tailwind CSS
- 本地存储：
  - localStorage：用户设置和简单配置
  - IndexedDB：健身项目数据和复杂结构
- 依赖库：
  - Dexie.js：IndexedDB的封装库
  - React Router：页面路由管理
  - Chart.js：数据可视化
  - Tailwind CSS：样式框架

## 项目结构
```
src/
├── components/           # React组件
│   ├── common/          # 通用组件
│   ├── layout/          # 布局组件
│   ├── projects/        # 项目相关组件
│   ├── settings/        # 设置相关组件
│   └── tracking/        # 跟踪相关组件
├── pages/               # 页面组件
│   ├── Home.jsx
│   ├── CreateProject.jsx
│   ├── ProjectDetail.jsx
│   ├── Tracking.jsx
│   └── Settings.jsx
├── services/            # 业务逻辑
│   ├── database.js      # IndexedDB操作
│   ├── storage.js       # localStorage操作
│   └── pwa.js           # PWA相关功能
├── styles/              # 样式文件
│   ├── global.css
│   └── variables.css
├── utils/               # 工具函数
│   └── helpers.js
├── App.jsx              # 根组件
└── main.jsx             # 入口文件
```

## 开发环境
- VS Code (推荐)
- Node.js
- npm/yarn包管理器
- 浏览器开发者工具
- Live Server插件（实时预览）

## 常用命令
- `npm run dev`：启动开发服务器 (localhost:3000)
- `npm run build`：构建生产版本
- `npm run preview`：预览生产版本

## 核心架构
### 模块划分
1. **用户管理模块**：处理用户设置、偏好配置和应用状态管理
2. **健身项目管理模块**：核心业务逻辑模块，处理健身项目的全生命周期
3. **数据存储模块**：统一的数据访问层，封装所有数据持久化操作
4. **提醒通知模块**：管理应用内所有提醒和通知，使用Service Worker实现后台提醒
5. **成长记录模块**：记录用户健身历程和成就，使用Chart.js进行数据可视化

### 数据存储
- **localStorage**：存储用户设置模型中的所有字段，JSON格式的键值对
- **IndexedDB**：存储所有复杂的数据结构，包括健身项目数据、用户成就数据、成长记录数据和提醒数据
- **数据库名**：fitness_tracker
- **数据库版本**：3

### PWA实现
- `manifest.json`：应用元数据配置
- `service-worker.js`：离线缓存和后台同步
- `index.html`：主页面模板
- 支持安装到主屏幕、离线访问、全屏体验

## 关键流程
- **项目创建流程**：首页 → 创建界面 → 填写表单 → 保存 → 返回首页
- **项目跟踪流程**：首页 → 项目详情 → 开始跟踪 → 实时更新 → 完成
- **数据查看流程**：首页 → 记录界面 → 选择时间范围 → 查看图表

## 开发指南

### 数据库操作
项目使用Dexie.js作为IndexedDB的封装库，数据库操作在`src/services/database.js`中定义。主要表包括：
- `fitness_projects`：存储健身项目数据
- `progress_records`：存储项目进度记录
- `user_preferences`：存储用户设置

### 路由管理
项目使用React Router进行路由管理，路由配置在`src/App.jsx`中定义：
- `/`：主页
- `/create`：创建项目页面
- `/project/:id`：项目详情页面
- `/tracking/:id`：项目跟踪页面
- `/settings`：设置页面

### 组件开发规范
1. 组件文件使用.jsx扩展名
2. 组件按功能分类存放于相应目录下
3. 使用函数组件和Hooks
4. 组件样式使用CSS类名，定义在`src/styles/global.css`中

### 状态管理
项目使用React的useState和useEffect进行状态管理，复杂状态可考虑使用Context API。

### 样式开发
1. 全局样式定义在`src/styles/global.css`中
2. 使用CSS类名而非内联样式
3. 遵循BEM命名规范

### 试运行和调试
1. 使用`npm run dev`启动开发服务器
2. 在浏览器开发者工具中查看控制台日志
3. 使用React Developer Tools调试组件状态
4. 使用IndexedDB查看器检查数据库内容

### 构建和部署
1. 使用`npm run build`构建生产版本
2. 使用`npm run preview`预览生产版本
3. 构建产物位于`dist/`目录下