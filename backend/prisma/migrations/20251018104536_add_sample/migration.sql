/*
  Warnings:

  - Added the required column `sampleText` to the `FigmaFont` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sampleText` to the `FontClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FigmaFont" ADD COLUMN     "sampleText" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."FontClass" ADD COLUMN     "sampleText" TEXT NOT NULL;
