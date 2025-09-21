# Image to Prompt 部署指南

## 项目概述

Image to Prompt 是一个基于 Next.js 的 AI 图片转提示词应用，集成了 Coze API 和 Google OAuth 登录。

## 功能特性

- 🖼️ 图片上传和 AI 提示词生成
- 🔐 Google OAuth 登录
- 🌍 多语言支持（中文/英文）
- 📱 响应式设计
- ⚡ 基于 Next.js 14 和 Bun

## 本地开发

### 1. 环境要求

- Node.js 18+ 
- Bun (推荐) 或 npm/yarn
- Google Cloud Console 账户

### 2. 快速启动

```bash
# 克隆项目
git clone <repository-url>
cd saasfly

# 安装依赖
bun install

# 配置环境变量
cp ENV_EXAMPLE.md apps/nextjs/.env.local
# 编辑 .env.local 文件，填入必要的环境变量

# 启动开发服务器
./start-dev.sh
# 或者
cd apps/nextjs && bun run dev
```

### 3. 访问应用

- 主页：http://localhost:3000
- 登录页：http://localhost:3000/zh/login
- 图片转提示词：http://localhost:3000/zh/imageprompt/generator

## 生产部署 (Vercel)

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret

# Coze API
COZE_TOKEN=your_coze_token
COZE_WORKFLOW_ID=your_workflow_id
COZE_API_BASE_URL=https://api.coze.cn
COZE_SPACE_ID=your_space_id

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 2. 部署命令

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

## Google OAuth 配置

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目：`image-to-prompt`
3. 启用 Google+ API

### 2. 配置 OAuth 2.0 客户端

**Authorized JavaScript origins:**
- `http://localhost:3000` (开发环境)
- `https://your-domain.vercel.app` (生产环境)

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (开发环境)
- `https://your-domain.vercel.app/api/auth/callback/google` (生产环境)

## Coze API 配置

### 1. 获取 API 凭据

1. 访问 [Coze 开放平台](https://www.coze.cn/open)
2. 创建应用并获取 PAT Token
3. 创建工作流并获取 Workflow ID

### 2. 配置参数

- `COZE_TOKEN`: 您的 PAT Token
- `COZE_WORKFLOW_ID`: 工作流 ID
- `COZE_API_BASE_URL`: https://api.coze.cn
- `COZE_SPACE_ID`: 空间 ID (可选)

## 项目结构

```
saasfly/
├── apps/
│   └── nextjs/                 # Next.js 应用
│       ├── src/
│       │   ├── app/            # App Router 页面
│       │   ├── components/     # React 组件
│       │   └── config/         # 配置文件
│       └── .env.local          # 环境变量
├── packages/
│   ├── auth/                   # 认证模块
│   ├── ui/                     # UI 组件库
│   └── common/                 # 公共模块
└── start-dev.sh               # 开发启动脚本
```

## 故障排除

### 常见问题

1. **Google 登录失败**
   - 检查 Client ID 和 Secret 是否正确
   - 确认重定向 URI 配置正确
   - 检查 Google Cloud 项目状态

2. **Coze API 调用失败**
   - 验证 Token 是否有效
   - 检查 Workflow ID 是否正确
   - 确认 API 端点配置

3. **环境变量问题**
   - 确保所有必需的环境变量都已设置
   - 检查变量名拼写是否正确
   - 重启开发服务器

### 调试模式

设置 `IS_DEBUG=true` 启用详细日志输出。

## 技术支持

如有问题，请检查：
1. 控制台错误信息
2. 网络请求状态
3. 环境变量配置
4. API 服务状态
