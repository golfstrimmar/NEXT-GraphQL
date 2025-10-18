/*
  Warnings:

  - You are about to drop the column `colorId` on the `FontClass` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FontClass" DROP CONSTRAINT "FontClass_colorId_fkey";

-- AlterTable
ALTER TABLE "public"."FontClass" DROP COLUMN "colorId",
ADD COLUMN     "colorVariableName" TEXT;
