-- CreateEnum
CREATE TYPE "RatingValue" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "PostRating" (
    "id" SERIAL NOT NULL,
    "value" "RatingValue" NOT NULL,
    "authorId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostRating_authorId_postId_key" ON "PostRating"("authorId", "postId");

-- AddForeignKey
ALTER TABLE "PostRating" ADD CONSTRAINT "PostRating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostRating" ADD CONSTRAINT "PostRating_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
