-- CreateTable
CREATE TABLE "ProductSize" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- Migrate existing products to ProductSize
INSERT INTO "ProductSize" ("id", "productId", "size", "currentStock", "minStock", "updatedAt")
SELECT
    "id" || '-size-standart',
    "id",
    'Standart',
    "currentStock",
    "minStock",
    CURRENT_TIMESTAMP
FROM "Product";

-- Add productSizeId to StockMovement
ALTER TABLE "StockMovement" ADD COLUMN "productSizeId" TEXT;

UPDATE "StockMovement"
SET "productSizeId" = "productId" || '-size-standart';

ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productId_fkey";
ALTER TABLE "StockMovement" DROP COLUMN "productId";
ALTER TABLE "StockMovement" ALTER COLUMN "productSizeId" SET NOT NULL;

-- Drop old Product columns
ALTER TABLE "Product" DROP COLUMN "currentStock";
ALTER TABLE "Product" DROP COLUMN "minStock";
ALTER TABLE "Product" DROP COLUMN "unit";

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_productId_size_key" ON "ProductSize"("productId", "size");

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "ProductSize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
