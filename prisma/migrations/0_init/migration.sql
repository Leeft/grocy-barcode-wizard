-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "grocyProductId" INTEGER,
    "pending" BOOLEAN NOT NULL,
    "canBeFrozen" BOOLEAN NOT NULL,
    "unitSystem" TEXT NOT NULL DEFAULT 'WEIGHT',
    "unitAmount" TEXT NOT NULL,
    "unitChosen" INTEGER NOT NULL,
    "defaultLocation" INTEGER NOT NULL,
    "dueDateType" TEXT NOT NULL DEFAULT 'BEST_BEFORE',
    "expiresAt" TEXT,
    "packagingDate" TEXT,
    "dueDays" INTEGER,
    "dueDaysAfterOpen" INTEGER,
    "dueDaysAfterFreezing" INTEGER,
    "dueDaysAfterThawing" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "productGroup" INTEGER,
    "parentProductId" INTEGER,
    "consumeLocationId" INTEGER,
    "defaultShop" INTEGER,
    "moveOnOpen" BOOLEAN NOT NULL DEFAULT false,
    "enableTareWeight" BOOLEAN NOT NULL DEFAULT false,
    "disableStockChecking" BOOLEAN NOT NULL DEFAULT false,
    "openedAsOutOfStock" BOOLEAN NOT NULL DEFAULT true,
    "accumulateSubProductsMinStock" BOOLEAN NOT NULL DEFAULT false,
    "tareWeight" TEXT,
    "energy" TEXT,
    "quickConsumeAmount" TEXT,
    "quickOpenAmount" TEXT,
    "purchasePriceType" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
    "cantOpen" BOOLEAN NOT NULL DEFAULT false,
    "dontShowOnStock" BOOLEAN NOT NULL DEFAULT false,
    "defaultQuantityUnitPurchase" INTEGER,
    "defaultQuantityUnitConsume" INTEGER,
    "quantityUnitPrices" INTEGER,
    "purchaseConversionFactor" TEXT,
    "consumeConversionFactor" TEXT,
    "priceConversionFactor" TEXT,
    "autoReprintStockLabel" BOOLEAN NOT NULL DEFAULT false,
    "defaultStockLabelType" TEXT NOT NULL DEFAULT 'NO_LABEL',
    "purchasePrice" TEXT,
    CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Barcode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "barcode" TEXT NOT NULL,
    "productId" INTEGER,
    "scannedAt" DATETIME NOT NULL,
    "queued" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Barcode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductPhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" TEXT NOT NULL DEFAULT 'image/png',
    "grocyFileGroup" TEXT DEFAULT 'productpictures',
    "grocyFileName" TEXT,
    "data" BLOB NOT NULL,
    "lastChanged" INTEGER,
    CONSTRAINT "ProductPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductPhoto_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "openCameraByDefault" BOOLEAN NOT NULL DEFAULT false,
    "playSoundOnScan" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserApiKey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "apiKey" TEXT NOT NULL,
    "created" DATETIME NOT NULL,
    CONSTRAINT "UserApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Barcode_barcode_key" ON "Barcode"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPhoto_productId_key" ON "ProductPhoto"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserApiKey_apiKey_key" ON "UserApiKey"("apiKey");

-- Custom SQL not defined in prisma: triggers

CREATE TRIGGER remove_product_data_before_delete BEFORE DELETE ON Product
BEGIN
    UPDATE Barcode SET productId = NULL, queued = false WHERE productId = OLD.id;
    DELETE FROM ProductPhoto WHERE ProductId = OLD.id;
END;
