/*
  Warnings:

  - A unique constraint covering the columns `[nodeId]` on the table `FigmaImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FigmaImage_nodeId_key" ON "public"."FigmaImage"("nodeId");
