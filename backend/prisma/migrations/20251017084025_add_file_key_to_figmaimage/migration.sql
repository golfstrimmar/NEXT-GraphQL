/*
  Warnings:

  - Added the required column `fileKey` to the `FigmaImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FigmaImage" ADD COLUMN     "fileKey" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "FigmaImage_fileKey_idx" ON "public"."FigmaImage"("fileKey");
