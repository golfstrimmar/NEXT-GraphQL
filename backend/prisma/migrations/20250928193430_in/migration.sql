-- CreateTable
CREATE TABLE "public"."FigmaProject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "FigmaProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FigmaProject_ownerId_name_key" ON "public"."FigmaProject"("ownerId", "name");

-- AddForeignKey
ALTER TABLE "public"."FigmaProject" ADD CONSTRAINT "FigmaProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
