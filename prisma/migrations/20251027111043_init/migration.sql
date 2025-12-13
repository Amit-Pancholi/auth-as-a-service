/*
  Warnings:

  - You are about to drop the `clienttoken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "token_schema"."clienttoken";

-- CreateTable
CREATE TABLE "token_schema"."client_token" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,

    CONSTRAINT "client_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_token_client_id_key" ON "token_schema"."client_token"("client_id");
