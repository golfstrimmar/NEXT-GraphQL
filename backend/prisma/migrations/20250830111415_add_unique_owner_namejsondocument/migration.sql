-- CreateTable
CREATE TABLE "public"."JsonDocument" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JsonDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JsonDocument_name_key" ON "public"."JsonDocument"("name");
