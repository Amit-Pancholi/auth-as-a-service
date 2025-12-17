-- AlterTable
ALTER TABLE "client_schema"."App" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "client_schema"."Client" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
