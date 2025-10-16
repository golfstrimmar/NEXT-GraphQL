/*
  Warnings:

  - The values [SVG] on the enum `ImageType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ImageType_new" AS ENUM ('RASTER', 'VECTOR');
ALTER TABLE "public"."FigmaImage" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."FigmaImage" ALTER COLUMN "type" TYPE "public"."ImageType_new" USING ("type"::text::"public"."ImageType_new");
ALTER TYPE "public"."ImageType" RENAME TO "ImageType_old";
ALTER TYPE "public"."ImageType_new" RENAME TO "ImageType";
DROP TYPE "public"."ImageType_old";
ALTER TABLE "public"."FigmaImage" ALTER COLUMN "type" SET DEFAULT 'RASTER';
COMMIT;
