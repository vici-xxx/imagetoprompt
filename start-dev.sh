#!/bin/bash

echo "🚀 启动 Image to Prompt 本地开发服务器..."
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查环境变量文件
if [ ! -f "apps/nextjs/.env.local" ]; then
    echo "⚠️  警告：未找到 .env.local 文件"
    echo "请参考 ENV_EXAMPLE.md 创建环境变量配置文件"
    echo ""
fi

# 安装依赖
echo "📦 安装依赖..."
bun install

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "访问地址：http://localhost:3000"
echo "登录页面：http://localhost:3000/zh/login"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

cd apps/nextjs && bun run dev
