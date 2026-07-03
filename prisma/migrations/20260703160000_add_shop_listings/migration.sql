-- CreateTable
CREATE TABLE "ShopListing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "sizeChart" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopReview" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopListing_productId_key" ON "ShopListing"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopListing_slug_key" ON "ShopListing"("slug");

-- AddForeignKey
ALTER TABLE "ShopListing" ADD CONSTRAINT "ShopListing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopListingImage" ADD CONSTRAINT "ShopListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ShopListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopReview" ADD CONSTRAINT "ShopReview_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ShopListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate published products to shop listings
INSERT INTO "ShopListing" ("id", "productId", "displayName", "slug", "salePrice", "description", "isPublished", "createdAt", "updatedAt")
SELECT
    md5(p."id" || '-listing') || substr(md5(random()::text), 1, 8),
    p."id",
    p."name",
    p."slug",
    p."salePrice",
    p."description",
    p."isPublished",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Product" p
WHERE p."isPublished" = true;

-- Copy product images to listing images
INSERT INTO "ShopListingImage" ("id", "listingId", "url", "sortOrder", "createdAt")
SELECT
    md5(pi."id" || '-img') || substr(md5(random()::text), 1, 8),
    sl."id",
    pi."url",
    pi."sortOrder",
    CURRENT_TIMESTAMP
FROM "ProductImage" pi
INNER JOIN "ShopListing" sl ON sl."productId" = pi."productId";
