# Saasfly 项目初始化指南

## 项目概述

Saasfly 是一个基于 Next.js 的企业级 SaaS 应用模板，提供了完整的用户认证、支付、多语言支持等功能。项目采用 Monorepo 架构，使用 Turbo 进行构建管理。

## 技术栈

### 核心框架
- **Next.js 14+** - React 全栈框架（使用 App Router）
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Shadcn/ui** - 基于 Radix UI 的组件库

### 认证与授权
- **Clerk** - 用户管理和认证平台（默认）
- **NextAuth.js** - 备选认证方案

### 数据库与 ORM
- **PostgreSQL** - 主数据库
- **Prisma** - 数据库 ORM 和模式管理
- **Kysely** - 类型安全的 SQL 查询构建器

### 状态管理与 API
- **tRPC** - 端到端类型安全的 API
- **TanStack Query** - 数据获取和缓存
- **Zustand** - 轻量级状态管理

### 支付与邮件
- **Stripe** - 支付处理
- **Resend** - 邮件发送服务

### 开发工具
- **Turbo** - Monorepo 构建系统
- **Bun** - 快速的包管理器
- **ESLint & Prettier** - 代码质量和格式化

## 项目结构

```
saasfly/
├── apps/
│   ├── nextjs/              # 主 Next.js 应用
│   └── auth-proxy/          # 认证代理服务
├── packages/
│   ├── api/                 # tRPC API 路由
│   ├── auth/                # 认证相关工具
│   ├── common/              # 共享工具和配置
│   ├── db/                  # 数据库模式和工具
│   ├── stripe/              # Stripe 支付集成
│   └── ui/                  # 共享 UI 组件
├── tooling/                 # 开发工具配置
└── turbo.json              # Turbo 配置
```

## 环境变量配置

### 必需的环境变量

创建 `.env.local` 文件并配置以下变量：

```bash
# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 认证配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# GitHub OAuth (用于 NextAuth)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Stripe 支付配置
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 数据库配置
POSTGRES_URL=postgresql://username:password@localhost:5432/saasfly

# 邮件配置 (可选)
RESEND_API_KEY=re_...
RESEND_FROM=noreply@yourdomain.com

# PostHog 分析 (可选)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Stripe 产品配置 (可选)

```bash
# Pro 计划
NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID=prod_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...

# Business 计划
NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID=prod_...
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...
```

## 初始化步骤

### 1. 安装依赖

```bash
# 使用 Bun 安装依赖
bun install

# 或者使用 npm
npm install
```

### 2. 设置数据库

```bash
# 推送数据库模式到 PostgreSQL
bun db:push

# 或者使用 npm
npm run db:push
```

### 3. 启动开发服务器

```bash
# 启动所有服务
bun dev

# 或者只启动 Web 应用（排除 Stripe）
bun dev:web

# 使用 npm
npm run dev
```

### 4. 访问应用

- 主应用: http://localhost:3000
- Tailwind 配置查看器: http://localhost:3333 (运行 `bun run tailwind-config-viewer`)

## 开发命令

```bash
# 开发
bun dev                    # 启动所有服务
bun dev:web               # 启动 Web 应用（排除 Stripe）

# 构建
bun build                 # 构建所有包
bun typecheck            # 类型检查
bun lint                 # 代码检查
bun lint:fix             # 修复代码问题

# 格式化
bun format               # 检查代码格式
bun format:fix           # 修复代码格式

# 数据库
bun db:push              # 推送数据库模式

# 清理
bun clean                # 清理所有 node_modules
bun clean:workspaces     # 清理工作区
```

## 数据库模式

项目使用 Prisma 管理数据库模式，主要包含以下模型：

- **User** - 用户信息
- **Account** - OAuth 账户关联
- **Session** - 用户会话
- **Customer** - 客户订阅信息
- **K8sClusterConfig** - Kubernetes 集群配置

## 功能特性

### 已实现功能
- ✅ 用户认证（Clerk + NextAuth）
- ✅ 多语言支持 (i18n)
- ✅ 响应式设计
- ✅ SEO 优化
- ✅ 支付集成 (Stripe)
- ✅ 邮件发送
- ✅ 管理面板（Alpha 版本）
- ✅ 类型安全的全栈开发

### 计划功能
- 🔄 管理面板完整功能
- 🔄 Payload CMS 集成
- 🔄 更多支付方式

## 部署

### Vercel 部署

1. 点击 [Vercel 部署按钮](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaasfly%2Fsaasfly&env=NEXT_PUBLIC_APP_URL,NEXTAUTH_URL,NEXTAUTH_SECRET,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,RESEND_API_KEY,RESEND_FROM&install-command=bun%20install&build-command=bun%20run%20build&root-directory=apps%2Fnextjs)

2. 配置环境变量

3. 连接 GitHub 仓库

### 手动部署

```bash
# 构建项目
bun build

# 部署到 Vercel
vercel --prod
```

## 常见问题

### 1. 数据库连接问题
确保 PostgreSQL 服务正在运行，并且 `POSTGRES_URL` 环境变量正确配置。

### 2. 认证问题
检查 Clerk 或 NextAuth 的配置是否正确，确保相关环境变量已设置。

### 3. Stripe 支付问题
确保 Stripe 的 API 密钥和 Webhook 密钥正确配置，并且 Webhook 端点已设置。

### 4. 构建问题
确保所有依赖都已正确安装，并且 Node.js 版本 >= 18。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](./LICENSE) 文件。

## 支持

- 文档: https://document.saasfly.io
- 演示: https://show.saasfly.io
- Discord: https://discord.gg/8SwSX43wnD
- 邮箱: contact@nextify.ltd

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 Clerk 认证
- 集成 Stripe 支付
- 多语言支持
- 管理面板 Alpha 版本

---

**注意**: 这是一个企业级 SaaS 模板，请根据实际需求进行定制和配置。
