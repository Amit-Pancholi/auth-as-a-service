/*
  Warnings:

  - Added the required column `app` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "app" TEXT NOT NULL;
