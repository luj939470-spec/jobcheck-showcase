ALTER TYPE "CategoryType" ADD VALUE IF NOT EXISTS 'RECOMMEND';
ALTER TYPE "CategoryType" ADD VALUE IF NOT EXISTS 'INTERNET';
ALTER TYPE "CategoryType" ADD VALUE IF NOT EXISTS 'LIFE_SERVICE';
ALTER TYPE "CategoryType" ADD VALUE IF NOT EXISTS 'AI';
ALTER TYPE "CategoryType" ADD VALUE IF NOT EXISTS 'SMART_HARDWARE';

CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "RecommendationType" AS ENUM ('COMPANY', 'REVIEW', 'CONTENT', 'AI_ENTRY');
CREATE TYPE "RecommendationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

ALTER TABLE "categories"
  ADD COLUMN "icon" VARCHAR(100),
  ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE';

DROP INDEX IF EXISTS "categories_parent_id_sort_order_idx";
DROP INDEX IF EXISTS "categories_type_is_active_sort_order_idx";
CREATE INDEX "categories_parent_id_sort_order_idx"
  ON "categories"("parent_id", "sort_order");
CREATE INDEX "categories_type_status_sort_order_idx"
  ON "categories"("type", "status", "sort_order");

CREATE TABLE "contents" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "category_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "description" VARCHAR(1000),
  "cover" VARCHAR(2048),
  "url" VARCHAR(2048) NOT NULL,
  "source" VARCHAR(120),
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3),
  CONSTRAINT "contents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "contents_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "contents_category_id_status_created_at_idx"
  ON "contents"("category_id", "status", "created_at");
CREATE INDEX "contents_status_view_count_idx"
  ON "contents"("status", "view_count");
CREATE INDEX "contents_deleted_at_idx" ON "contents"("deleted_at");

CREATE TABLE "recommendations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "RecommendationType" NOT NULL,
  "target_id" UUID,
  "title" VARCHAR(200),
  "description" VARCHAR(500),
  "icon" VARCHAR(100),
  "url" VARCHAR(2048),
  "sort" INTEGER NOT NULL DEFAULT 0,
  "status" "RecommendationStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recommendations_type_status_sort_idx"
  ON "recommendations"("type", "status", "sort");
CREATE INDEX "recommendations_target_id_idx"
  ON "recommendations"("target_id");

INSERT INTO "categories"
  ("id", "type", "code", "name", "description", "icon", "level", "sort_order",
   "status", "is_active", "created_at", "updated_at")
VALUES
  ('10000000-0000-4000-8000-000000000001', 'RECOMMEND', 'recommend',
   '推荐', '热门企业、评价和精选内容', 'home', 1, 10, 'ACTIVE', true,
   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000002', 'INTERNET', 'internet',
   '互联网', '技术资讯、程序员工具、开发资源和开源项目', 'globe', 1, 20,
   'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000003', 'AI', 'ai',
   'AI', '进入 AI 智能助手', 'sparkles', 1, 30, 'ACTIVE', true,
   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000004', 'SMART_HARDWARE', 'smart-hardware',
   '智能硬件', '智能硬件分类入口', 'cpu', 1, 40, 'ACTIVE', true,
   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000005', 'LIFE_SERVICE', 'life-service',
   '生活服务', '求职工具、简历工具、招聘网站和学习资源', 'briefcase', 1, 50,
   'ACTIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("type", "code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "icon" = EXCLUDED."icon",
  "sort_order" = EXCLUDED."sort_order",
  "status" = EXCLUDED."status",
  "is_active" = true,
  "deleted_at" = NULL,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "recommendations"
  ("id", "type", "title", "description", "icon", "url", "sort", "status", "updated_at")
VALUES
  ('20000000-0000-4000-8000-000000000001', 'AI_ENTRY', 'AI 智能助手',
   '企业分析、简历优化与模拟面试', 'sparkles', '/ai', 10, 'ACTIVE',
   CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
