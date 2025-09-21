# 环境变量配置示例

## 创建 .env.local 文件

在 `apps/nextjs/` 目录下创建 `.env.local` 文件，包含以下内容：

```bash
# Google OAuth 配置
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Coze API 配置
COZE_TOKEN=your_coze_token_here
COZE_WORKFLOW_ID=your_workflow_id_here
COZE_API_BASE_URL=https://api.coze.cn
COZE_SPACE_ID=your_space_id_here

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 数据库配置 (可选，用于本地开发)
POSTGRES_URL=your_postgres_url_here

# 邮件配置 (可选，用于本地开发)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM=noreply@yourdomain.com

# Stripe 配置 (可选，用于本地开发)
STRIPE_API_KEY=your_stripe_api_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# 管理员邮箱 (可选)
ADMIN_EMAIL=admin@yourdomain.com

# 调试模式
IS_DEBUG=true
```

## 必需的环境变量

对于基本功能，您至少需要配置：

1. **Google OAuth** (用于登录)
2. **NextAuth Secret** (用于会话管理)
3. **Coze API** (用于图片转提示词功能)

## 生成 NextAuth Secret

```bash
openssl rand -base64 32
```

## 获取 Google OAuth 凭据

请参考 `GOOGLE_OAUTH_SETUP.md` 文件中的详细说明。
