/*
  Warnings:

  - You are about to drop the column `tokenVersion` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PostRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostRating" DROP CONSTRAINT "PostRating_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostRating" DROP CONSTRAINT "PostRating_postId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tokenVersion";

-- DropTable
DROP TABLE "PostRating";

-- DropEnum
DROP TYPE "RatingValue";
