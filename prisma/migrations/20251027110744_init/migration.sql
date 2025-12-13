-- CreateTable
CREATE TABLE "token_schema"."token" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "app_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_schema"."clienttoken" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,

    CONSTRAINT "clienttoken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_user_id_client_id_app_id_key" ON "token_schema"."token"("user_id", "client_id", "app_id");

-- CreateIndex
CREATE UNIQUE INDEX "clienttoken_client_id_key" ON "token_schema"."clienttoken"("client_id");
