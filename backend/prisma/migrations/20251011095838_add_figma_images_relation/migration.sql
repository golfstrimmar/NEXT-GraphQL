-- CreateTable
CREATE TABLE "public"."FigmaImage" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "imageRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "figmaProjectId" INTEGER NOT NULL,

    CONSTRAINT "FigmaImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FigmaImage" ADD CONSTRAINT "FigmaImage_figmaProjectId_fkey" FOREIGN KEY ("figmaProjectId") REFERENCES "public"."FigmaProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
