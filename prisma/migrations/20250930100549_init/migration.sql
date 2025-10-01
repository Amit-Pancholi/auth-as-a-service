/*
  Warnings:

  - Changed the type of `client_id` on the `token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `app_id` on the `token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "token_schema"."token" DROP COLUMN "client_id",
ADD COLUMN     "client_id" INTEGER NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "app_id",
ADD COLUMN     "app_id" INTEGER NOT NULL;
