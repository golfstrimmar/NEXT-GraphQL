-- AlterTable
ALTER TABLE "public"."FontClass" ADD COLUMN     "colorId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."FontClass" ADD CONSTRAINT "FontClass_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."ColorVariable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
