-- CreateTable
CREATE TABLE "client_schema"."Client" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile_No" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_schema"."Logout_Token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Logout_Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_schema"."App" (
    "id" SERIAL NOT NULL,
    "app_name" TEXT NOT NULL,
    "client_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "secret" TEXT NOT NULL DEFAULT 'empty',

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "client_schema"."Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_mobile_No_key" ON "client_schema"."Client"("mobile_No");
