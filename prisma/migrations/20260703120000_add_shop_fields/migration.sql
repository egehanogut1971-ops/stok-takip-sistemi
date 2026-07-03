-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "description" TEXT;
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
ALTER TABLE "Product" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- Backfill slug for existing products
UPDATE "Product"
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) || '-' || SUBSTRING("id", 1, 8)
WHERE "slug" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
