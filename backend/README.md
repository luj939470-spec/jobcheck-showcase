# JobCheck Backend

JobCheck 的 NestJS 后端基础工程。当前包含公共基础设施和 Prisma 数据库模型，不包含业务接口或业务模块。

## 环境要求

- Node.js 20.11 或更高版本
- pnpm
- PostgreSQL

## 本地启动

```bash
cp .env.example .env
pnpm install
pnpm prisma:generate
docker compose up -d
pnpm start:dev
```

默认地址：

- API 前缀：`http://localhost:3000/api/v1`
- Swagger：`http://localhost:3000/api/docs`
- 健康检查：`http://localhost:3000/api/v1/health`

启动前请根据本地 PostgreSQL 配置修改 `.env` 中的 `DATABASE_URL`。如使用本项目
`docker-compose.yml`，示例连接串可直接使用。
