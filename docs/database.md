# JobCheck 数据库设计说明

## 1. 设计范围

本设计使用 PostgreSQL 与 Prisma，覆盖当前要求的用户、企业、分类、员工评价、评论、点赞、收藏、企业认证和 AI 聊天记录。模型统一使用 UUID 主键、`snake_case` 数据库命名和带时区的毫秒级时间戳。

`CompanyCategory` 是企业与分类的显式多对多关联表，用于保证外键、索引和删除策略可见、可控。职位等未列入本次核心范围的业务表不在本次 schema 中。

## 2. 核心关系

```text
User 1 ── N Review N ── 1 Company
                  │
                  └── N Comment（Comment 可回复 Comment）

Company N ── N Category（通过 CompanyCategory）
Company 1 ── N Verification

User 1 ── N Like ── 1 Review 或 Comment
User 1 ── N Favorite ── 1 Company 或 Review
User 1 ── N AIHistory（conversationId + sequence 组成会话消息顺序）
```

## 3. 表职责

### User

保存账号、登录标识、基础资料、角色和账号状态。邮箱与手机号均允许为空但各自唯一，以支持邮箱、手机号或第三方登录的后续扩展。`deletedAt` 用于软删除。

### Company

保存企业展示信息、工商主体信息、地区和经营状态。`unifiedSocialCreditCode` 唯一，避免同一工商主体重复建档；尚未获得统一社会信用代码时允许为空。

`reviewCount`、`ratingAverage` 和四个维度平均分是面向高频列表与详情查询的缓存聚合值。它们只统计 `PUBLISHED` 且未软删除的评价，并应在评价发布、隐藏、恢复或评分变更时，在同一事务中重新计算或增量更新。`ratingUpdatedAt` 标识聚合数据的新鲜度。

### Category 与 CompanyCategory

`Category` 通过 `type + code` 保证稳定分类编码唯一，支持父子层级。`CompanyCategory` 允许企业属于多个行业或主题分类，`isPrimary` 标识主分类。

### Review

评价必须保存真实的 `authorId`。`isAnonymous` 只控制前台是否隐藏作者，不能清除后台身份关系，满足“前台匿名不等于后台无身份”的要求。

`isVerifiedEmployee` 和 `employeeVerifiedAt` 是评价发布/审核时的员工认证快照。任职证明原件不放入评价表；后续接入对象存储时应建立独立、受限访问且有保存期限的证明材料表。

总评分及工作体验、管理、福利、成长四项评分保存为结构化数值。互动计数为缓存字段，真实关系以 `Like`、`Comment`、`Favorite` 为准。

### Comment

`parentId` 是评论自关联外键，用于回复。业务层应校验父评论与子评论属于同一评价，并可限制回复层级；展示时可以按 `parentId` 构造树。

评论采用软删除：删除后保留占位和回复链路。若确需物理删除父评论，`parentId` 使用 `SET NULL`，已有回复不会被连带删除。

### Like

一条点赞只能指向一条评价或一条评论。两组唯一约束分别保证同一用户不能重复点赞同一评价或评论。删除目标内容或用户时，点赞关系级联删除。

### Favorite

一条收藏只能指向一家企业或一条评价。两组唯一约束分别防止重复收藏。职位不属于本次建模范围；未来增加 `Job` 时，应新增可空 `jobId` 外键及对应唯一约束，而不是改用无法保证引用完整性的通用 `targetId`。

### Verification

每次企业认证申请单独保留记录，以支持审核历史、过期、撤销和重新申请。认证材料 URL 和元数据属于敏感数据，不应出现在普通企业查询中。`requestedById` 与 `reviewedById` 可空，以保留外部同步或历史审核场景。

`Company.verificationStatus` 是当前状态缓存，权威审计记录仍是 `Verification`。更新认证结果时二者应在同一事务中变更。

### AIHistory

每行是一条 AI 会话消息。`conversationId` 对消息分组，`sequence` 保证会话内稳定顺序，两者组合唯一。消息支持角色、状态、模型、token 用量、结构化上下文与引用来源。用户物理删除时聊天记录级联删除；日常“删除会话”使用 `deletedAt` 软删除。

不应把任职证明、身份证件、密码、完整简历等敏感原文写入 `content`、`context` 或 `citations`。

## 4. 数据完整性约束

Prisma schema 已表达主键、外键、唯一约束和索引。以下 PostgreSQL `CHECK` 约束 Prisma 6 schema 不能直接声明，应在首次迁移生成后补入迁移 SQL，并纳入迁移测试：

```sql
ALTER TABLE "users"
  ADD CONSTRAINT "users_login_identifier_check"
  CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL);

ALTER TABLE "companies"
  ADD CONSTRAINT "companies_rating_aggregates_check"
  CHECK (
    "review_count" >= 0
    AND "rating_average" BETWEEN 0 AND 5
    AND "work_score_average" BETWEEN 0 AND 5
    AND "management_score_average" BETWEEN 0 AND 5
    AND "benefits_score_average" BETWEEN 0 AND 5
    AND "growth_score_average" BETWEEN 0 AND 5
  );

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_scores_check"
  CHECK (
    "rating" BETWEEN 1 AND 5
    AND "work_score" BETWEEN 1 AND 5
    AND "management_score" BETWEEN 1 AND 5
    AND "benefits_score" BETWEEN 1 AND 5
    AND "growth_score" BETWEEN 1 AND 5
    AND "like_count" >= 0
    AND "comment_count" >= 0
    AND "favorite_count" >= 0
  );

ALTER TABLE "comments"
  ADD CONSTRAINT "comments_counts_check"
  CHECK ("like_count" >= 0 AND "reply_count" >= 0);

ALTER TABLE "likes"
  ADD CONSTRAINT "likes_exactly_one_target_check"
  CHECK (num_nonnulls("review_id", "comment_id") = 1);

ALTER TABLE "favorites"
  ADD CONSTRAINT "favorites_exactly_one_target_check"
  CHECK (num_nonnulls("company_id", "review_id") = 1);

ALTER TABLE "ai_history"
  ADD CONSTRAINT "ai_history_usage_check"
  CHECK (
    "sequence" >= 0
    AND ("prompt_tokens" IS NULL OR "prompt_tokens" >= 0)
    AND ("completion_tokens" IS NULL OR "completion_tokens" >= 0)
  );
```

分类层级还应由服务层或数据库触发器防止循环引用。企业主分类“每家企业最多一个”可在迁移中增加部分唯一索引：

```sql
CREATE UNIQUE INDEX "company_categories_one_primary"
ON "company_categories" ("company_id")
WHERE "is_primary" = true;
```

## 5. 删除策略

| 主记录 | 关联记录 | 外键策略 | 说明 |
| --- | --- | --- | --- |
| User | Review、Comment | `RESTRICT` | 用户日常删除采用软删除，避免破坏内容归属和匿名审计 |
| User | Like、Favorite、AIHistory | `CASCADE` | 物理删除账号时清除私人互动及聊天历史 |
| User | Verification 审核/申请人 | `SET NULL` | 保留企业认证审计记录 |
| Company | Review、Verification | `RESTRICT` | 有业务历史的企业不得物理删除，使用软删除 |
| Company | CompanyCategory、Favorite | `CASCADE` | 物理删除企业时清理纯关系数据 |
| Category | 子分类、CompanyCategory | `RESTRICT` | 防止误删仍被引用的分类 |
| Category | Review | `SET NULL` | 删除可选分类不删除评价 |
| Review | Comment、Like、Favorite | `CASCADE` | 物理删除评价时清除其互动数据 |
| Comment | 子评论 | `SET NULL` | 保留回复内容，断开已删除父评论 |
| Comment | Like | `CASCADE` | 物理删除评论时清除点赞 |

`User`、`Company`、`Category`、`Review`、`Comment`、`Verification` 和 `AIHistory` 均提供 `deletedAt`。常规查询必须显式过滤 `deletedAt IS NULL`；物理删除只用于数据清理、测试或合规流程，并应在事务中执行。

## 6. 索引与查询路径

- 企业列表：经营状态、认证状态、地区、评分及软删除状态。
- 评价流：企业/分类/审核状态/发布时间，以及作者的评价列表。
- 评论：评价、父评论、状态和时间，适合分页读取根评论与回复。
- 点赞与收藏：用户维度的个人列表及目标维度计数、状态查询。
- 认证：企业审核历史、待审队列和过期扫描。
- AI 历史：用户会话、会话内消息顺序、消息状态。

索引均围绕实际过滤和排序路径设计。低基数字段没有全部建立单列索引，而是与企业、状态、时间等组合，减少无效索引和写放大。

## 7. 时间与并发

- `createdAt` 默认使用数据库当前时间，`updatedAt` 由 Prisma 自动更新；所有时间映射为 PostgreSQL `timestamptz(3)`。
- 点赞、收藏的创建依赖唯一约束实现幂等；并发冲突应作为“已存在”处理。
- 评价、评论互动计数和企业评分聚合必须通过数据库事务更新。计数可定期依据关系表校准，避免缓存值长期漂移。
- 软删除记录参与唯一约束：邮箱、手机号、企业统一社会信用代码和 slug 如需复用，必须先完成明确的账号恢复或数据匿名化流程，不应静默复用身份标识。
