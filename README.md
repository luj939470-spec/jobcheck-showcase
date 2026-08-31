# JobCheck（开发中）

JobCheck 是一个面向大学生实习、校招和早期职业选择的企业评价平台原型。项目希望把企业资料、匿名经历、结构化评分、薪资样本和面试信息集中到一个可检索的界面中，帮助求职者在投递前获得更完整的参考。

> 当前状态：**开发中 / 个人展示项目**。仓库中的企业和评价均为用于功能演示的模拟种子数据，不代表相关企业的官方信息或全部员工体验，也不是已经上线运营的真实评价平台。

## 当前技术栈

### 前端

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Material UI、Radix UI、Lucide React
- 原生 History API 驱动的轻量页面导航

### 后端

- NestJS 11 + TypeScript
- Prisma ORM 6
- PostgreSQL
- JWT 登录认证、bcrypt 密码哈希
- Swagger/OpenAPI
- Pino 结构化日志
- 可选的豆包或通义千问兼容接口

## 已完成的功能

- 用户注册、登录和个人资料读取接口
- 企业列表、关键词搜索和行业筛选
- 企业详情、规模、城市、融资阶段、官网、标签及热门岗位展示
- 企业综合评分、分项评分、薪资区间和面试难度统计
- 已审核评价列表
- 登录用户提交匿名评价，评价默认进入待审核状态
- 评价审核、点赞、评论和企业收藏后端接口
- 首页热门企业、热门评价、内容推荐和分类入口
- AI 求职助手聊天接口：根据站内企业与评价数据生成结构化求职摘要
- 公司分析、简历评审和模拟面试后端接口（需要配置外部 AI 服务）
- 健康检查、统一 API 响应、参数校验、异常处理和 Swagger 文档
- 可重复执行的 Prisma seed：114 家企业、582 条模拟评价，覆盖 9 个主要求职行业分类

## 模拟数据与仅部分接通的能力

- 114 家企业和 582 条评价均为测试数据。企业名称用于方便演示检索，地址、规模、融资信息、岗位和评价内容不应视为实时事实。
- `/api/v1/ai/chat` 当前主要基于数据库字段和固定分析规则生成回答，不等同于通用大模型对话。
- 企业深度分析、简历评审和模拟面试接口支持豆包或通义千问兼容服务，但必须自行配置 API Key；部分能力尚未在前端形成完整操作流程。
- 管理员审核、内容管理等接口已存在，但尚无完整后台管理界面。

## 尚未完成与已知限制

- 尚未接入真实企业数据源、企业认证流程或真实用户运营数据。
- 缺少举报、申诉、内容风控和完善的审核工作台。
- 缺少找回密码、第三方登录、邮箱验证等完整账户流程。
- 暂无自动化单元测试和端到端测试套件；当前主要依赖类型检查、构建和人工验收。
- 当前迁移目录缺少初始建表迁移，新建空数据库时应先执行 `prisma db push`。在补齐基线迁移前，不建议直接依赖 `prisma migrate deploy` 初始化空库。
- 当前界面以移动端视觉原型为主，桌面端响应式布局和无障碍体验仍需继续完善。
- 仓库不包含部署配置，生产环境安全、备份、监控和扩容方案尚未完成。

## 本地安装与启动

### 环境要求

- Node.js 20.11 或更高版本
- pnpm
- PostgreSQL 14+，或 Docker / Docker Compose

### 1. 启动 PostgreSQL

```bash
cd backend
docker compose up -d
```

`docker-compose.yml` 提供开发用数据库：

- 地址：`localhost:5432`
- 数据库：`jobcheck`
- 用户：`jobcheck`

### 2. 配置并启动后端

```bash
cd backend
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm exec prisma db push
pnpm prisma:seed
pnpm start:dev
```

Windows PowerShell 可使用：

```powershell
Copy-Item .env.example .env
```

后端默认地址：

- API：`http://localhost:3000/api/v1`
- 健康检查：`http://localhost:3000/api/v1/health`
- Swagger：`http://localhost:3000/api/docs`

`.env.example` 只包含本地开发占位值。部署或连接外部 AI 服务时，请在本地 `.env` 中使用独立的强随机 JWT Secret 和真实 API Key，切勿提交 `.env`。

### 3. 配置并启动前端

```bash
cd app
cp .env.example .env
pnpm install
pnpm dev
```

前端默认地址：`http://localhost:5173`。

## 常用检查命令

```bash
# 前端
cd app
pnpm typecheck
pnpm build

# 后端
cd backend
pnpm typecheck
pnpm build
pnpm prisma:validate
```

## 目录说明

```text
jobcheck-showcase/
├─ app/                     # React/Vite 前端
│  ├─ src/api/             # API 请求与类型
│  ├─ src/app/             # 页面与 UI 组件
│  ├─ src/auth/            # 前端认证状态
│  └─ src/styles/          # 主题和样式
├─ backend/                 # NestJS 后端
│  ├─ src/auth/            # 注册、登录与 JWT
│  ├─ src/company/         # 企业查询与统计
│  ├─ src/review/          # 评价提交与审核
│  ├─ src/ai/              # AI 助手及服务商适配
│  ├─ src/recommend/       # 首页推荐
│  └─ prisma/              # 数据模型、seed 和迁移
├─ docs/                    # 数据库设计说明
└─ README.md                # 项目状态与运行说明
```

## 数据说明

Seed 数据按确定性 ID 使用 upsert 写入，可重复运行。主要分类包括：

- 互联网科技
- 游戏公司
- AI 公司
- 金融企业
- 国企
- 外企
- 快消企业
- 制造业
- 设计 / 传媒企业

每家种子企业至少包含实习体验、面试体验、工作节奏与加班、薪资福利、团队氛围五类评价主题。

## 第三方资源与署名

前端最初基于 JobCheck Mobile App Design System 原型继续开发。第三方组件及设计资源署名保留在 [app/ATTRIBUTIONS.md](app/ATTRIBUTIONS.md) 和 [app/README.md](app/README.md) 中。

## 免责声明

本项目仅用于学习、作品集和技术展示。测试数据不构成求职、薪酬或企业评价建议；真实求职决策请结合企业官方信息、正式招聘材料和多方来源判断。
