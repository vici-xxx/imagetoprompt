# Google OAuth 配置指南

## 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 项目名称建议：`image-to-prompt`

## 2. 启用 Google+ API

1. 在左侧菜单中，转到 "APIs & Services" > "Library"
2. 搜索 "Google+ API" 或 "Google Identity"
3. 点击 "Enable" 启用 API

## 3. 创建 OAuth 2.0 客户端

1. 转到 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
3. 选择 "Web application"
4. 配置以下信息：
   - **Name**: `Image to Prompt Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (本地开发)
     - `https://your-domain.vercel.app` (生产环境)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (本地开发)
     - `https://your-domain.vercel.app/api/auth/callback/google` (生产环境)

## 4. 获取客户端凭据

创建完成后，您将获得：
- **Client ID**: 类似 `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret**: 类似 `GOCSPX-abcdefghijklmnopqrstuvwxyz`

## 5. 配置环境变量

### 本地开发 (.env.local)
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# 其他必需的环境变量
COZE_TOKEN=your_coze_token
COZE_WORKFLOW_ID=your_workflow_id
```

### Vercel 生产环境
在 Vercel 项目设置中添加相同的环境变量。

## 6. 生成 NextAuth Secret

```bash
openssl rand -base64 32
```

## 7. 测试配置

1. 启动本地开发服务器：`bun run dev`
2. 访问 `http://localhost:3000/login`
3. 点击 "使用 Google 登录" 按钮
4. 应该会重定向到 Google 登录页面

## 故障排除

### 常见问题：

1. **"redirect_uri_mismatch" 错误**
   - 确保重定向 URI 完全匹配
   - 检查是否包含 `http://` 或 `https://`

2. **"invalid_client" 错误**
   - 检查 Client ID 和 Client Secret 是否正确
   - 确保没有多余的空格或字符

3. **"access_denied" 错误**
   - 检查 Google Cloud 项目是否正确
   - 确保 API 已启用

## 安全注意事项

- 永远不要将 Client Secret 提交到代码仓库
- 使用环境变量存储敏感信息
- 定期轮换 Client Secret
- 限制 Authorized JavaScript origins 和 redirect URIs
