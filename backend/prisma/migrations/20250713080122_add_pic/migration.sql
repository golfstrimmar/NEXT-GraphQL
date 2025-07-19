/*
  Warnings:

  - You are about to drop the `CommentDislike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CommentDislike" DROP CONSTRAINT "CommentDislike_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentDislike" DROP CONSTRAINT "CommentDislike_userId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLike" DROP CONSTRAINT "CommentLike_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CommentLike" DROP CONSTRAINT "CommentLike_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "CommentDislike";

-- DropTable
DROP TABLE "CommentLike";
