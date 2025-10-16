-- CreateTable
CREATE TABLE "public"."ColorVariable" (
    "id" SERIAL NOT NULL,
    "variableName" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "figmaProjectId" INTEGER NOT NULL,

    CONSTRAINT "ColorVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FontClass" (
    "id" SERIAL NOT NULL,
    "className" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "fontWeight" INTEGER NOT NULL,
    "fontSize" DOUBLE PRECISION NOT NULL,
    "lineHeight" DOUBLE PRECISION,
    "letterSpacing" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "figmaProjectId" INTEGER NOT NULL,

    CONSTRAINT "FontClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FigmaColor" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "source" TEXT,
    "nodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "figmaProjectId" INTEGER NOT NULL,

    CONSTRAINT "FigmaColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FigmaFont" (
    "id" SERIAL NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "fontWeight" INTEGER NOT NULL,
    "fontSize" DOUBLE PRECISION NOT NULL,
    "lineHeight" DOUBLE PRECISION,
    "letterSpacing" DOUBLE PRECISION,
    "source" TEXT,
    "nodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "figmaProjectId" INTEGER NOT NULL,

    CONSTRAINT "FigmaFont_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColorVariable_figmaProjectId_variableName_key" ON "public"."ColorVariable"("figmaProjectId", "variableName");

-- CreateIndex
CREATE UNIQUE INDEX "FontClass_figmaProjectId_className_key" ON "public"."FontClass"("figmaProjectId", "className");

-- AddForeignKey
ALTER TABLE "public"."ColorVariable" ADD CONSTRAINT "ColorVariable_figmaProjectId_fkey" FOREIGN KEY ("figmaProjectId") REFERENCES "public"."FigmaProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FontClass" ADD CONSTRAINT "FontClass_figmaProjectId_fkey" FOREIGN KEY ("figmaProjectId") REFERENCES "public"."FigmaProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FigmaColor" ADD CONSTRAINT "FigmaColor_figmaProjectId_fkey" FOREIGN KEY ("figmaProjectId") REFERENCES "public"."FigmaProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FigmaFont" ADD CONSTRAINT "FigmaFont_figmaProjectId_fkey" FOREIGN KEY ("figmaProjectId") REFERENCES "public"."FigmaProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
