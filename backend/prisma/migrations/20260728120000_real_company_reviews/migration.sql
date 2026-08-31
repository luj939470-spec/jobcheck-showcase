CREATE TYPE "ReviewType" AS ENUM ('INTERNSHIP', 'INTERVIEW', 'WORK');
CREATE TYPE "ExperienceType" AS ENUM ('INTERN', 'FULL_TIME');

ALTER TABLE "companies"
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "reviews"
  ADD COLUMN "review_type" "ReviewType" NOT NULL DEFAULT 'WORK',
  ADD COLUMN "experience_type" "ExperienceType" NOT NULL DEFAULT 'FULL_TIME',
  ADD COLUMN "advantage" TEXT,
  ADD COLUMN "disadvantage" TEXT,
  ADD COLUMN "salary" INTEGER,
  ADD COLUMN "interview_difficulty" SMALLINT;

DROP INDEX IF EXISTS "reviews_company_id_user_id_key";
CREATE INDEX "reviews_company_id_review_type_status_idx"
  ON "reviews"("company_id", "review_type", "status");
