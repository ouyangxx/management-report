#!/bin/bash
set -euo pipefail

echo "🚀 开始部署 Management Report 到 Cloudflare Workers"
echo ""

# 步骤1: 初始化数据库
echo ""
echo "📦 步骤1: 初始化数据库表..."
WRANGLER_LOG_PATH=.wrangler/wrangler.log npx wrangler d1 execute management-report-db --remote --file=./db/init.sql

# 步骤2: 构建项目
echo ""
echo "📦 步骤2: 构建项目..."
npm run build

# 步骤3: 部署
echo ""
echo "📦 步骤3: 部署到 Cloudflare Workers..."
WRANGLER_LOG_PATH=.wrangler/wrangler.log npx wrangler deploy --config wrangler.worker.toml --domain ockbrye.kdns.fr

echo ""
echo "✅ 部署完成！"
