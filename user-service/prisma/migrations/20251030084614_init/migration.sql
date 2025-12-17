-- CreateTable
CREATE TABLE "logout_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "logout_token_pkey" PRIMARY KEY ("id")
);
