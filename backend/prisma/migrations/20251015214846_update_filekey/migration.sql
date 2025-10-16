/*
  Warnings:

  - You are about to drop the column `figmaProjectId` on the `ColorVariable` table. All the data in the column will be lost.
  - You are about to drop the column `figmaProjectId` on the `FigmaFont` table. All the data in the column will be lost.
  - The `type` column on the `FigmaImage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `figmaProjectId` on the `FontClass` table. All the data in the column will be lost.
  - You are about to drop the `FigmaColor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fileKey,variableName]` on the table `ColorVariable` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileKey,fontFamily,fontWeight,fontSize,lineHeight,letterSpacing]` on the table `FigmaFont` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[figmaProjectId,nodeId]` on the table `FigmaImage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileKey,className]` on the table `FontClass` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileKey` to the `ColorVariable` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `ColorVariable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `fileKey` to the `FigmaFont` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileKey` to the `FontClass` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ColorType" AS ENUM ('PALETTE', 'TEXT', 'BACKGROUND', 'FILL', 'STROKE');

-- CreateEnum
CREATE TYPE "public"."ImageType" AS ENUM ('RASTER', 'SVG');

-- DropForeignKey
ALTER TABLE "public"."ColorVariable" DROP CONSTRAINT "ColorVariable_figmaProjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FigmaColor" DROP CONSTRAINT "FigmaColor_figmaProjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FigmaFont" DROP CONSTRAINT "FigmaFont_figmaProjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FontClass" DROP CONSTRAINT "FontClass_figmaProjectId_fkey";

-- DropIndex
DROP INDEX "public"."ColorVariable_figmaProjectId_variableName_key";

-- DropIndex
DROP INDEX "public"."FigmaImage_nodeId_key";

-- DropIndex
DROP INDEX "public"."FontClass_figmaProjectId_className_key";

-- AlterTable
ALTER TABLE "public"."ColorVariable" DROP COLUMN "figmaProjectId",
ADD COLUMN     "fileKey" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."ColorType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."FigmaFont" DROP COLUMN "figmaProjectId",
ADD COLUMN     "fileKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."FigmaImage" DROP COLUMN "type",
ADD COLUMN     "type" "public"."ImageType" NOT NULL DEFAULT 'RASTER';

-- AlterTable
ALTER TABLE "public"."FontClass" DROP COLUMN "figmaProjectId",
ADD COLUMN     "fileKey" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."FigmaColor";

-- CreateIndex
CREATE INDEX "ColorVariable_fileKey_idx" ON "public"."ColorVariable"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "ColorVariable_fileKey_variableName_key" ON "public"."ColorVariable"("fileKey", "variableName");

-- CreateIndex
CREATE INDEX "FigmaFont_fileKey_idx" ON "public"."FigmaFont"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "FigmaFont_fileKey_fontFamily_fontWeight_fontSize_lineHeight_key" ON "public"."FigmaFont"("fileKey", "fontFamily", "fontWeight", "fontSize", "lineHeight", "letterSpacing");

-- CreateIndex
CREATE INDEX "FigmaImage_figmaProjectId_idx" ON "public"."FigmaImage"("figmaProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "FigmaImage_figmaProjectId_nodeId_key" ON "public"."FigmaImage"("figmaProjectId", "nodeId");

-- CreateIndex
CREATE INDEX "FontClass_fileKey_idx" ON "public"."FontClass"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "FontClass_fileKey_className_key" ON "public"."FontClass"("fileKey", "className");
