# Cloudflare 部署指南

## 1. 创建 D1 数据库
```bash
wrangler d1 create management-report-db
```
当前项目已配置的 database_id 是 `f0ae3126-e26e-4b76-81b8-e1c40bb1f824`。

## 2. 初始化数据库表
```bash
WRANGLER_LOG_PATH=.wrangler/wrangler.log npx wrangler d1 execute management-report-db --remote --file=./db/init.sql
```

## 3. 构建项目
```bash
npm run build
```

## 4. 部署到 Cloudflare Workers
```bash
WRANGLER_LOG_PATH=.wrangler/wrangler.log npx wrangler deploy --config wrangler.worker.toml --domain ockbrye.kdns.fr
```

## 注意事项
- 首次部署需要登录 Cloudflare 账号：`wrangler login`
- 当前绑定的公网域名是 `https://ockbrye.kdns.fr/`
- `/api/shared-config` 读写共享 D1 数据库
- `/api/shared-config/download` 会从 D1 查询最新配置并生成 Excel 下载
