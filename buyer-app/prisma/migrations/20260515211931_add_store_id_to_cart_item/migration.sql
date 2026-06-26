-- CreateEnum
CREATE TYPE "MockSellerOrderStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'READY', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MockSellerOrder" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "totalWeight" DECIMAL(10,2) NOT NULL,
    "status" "MockSellerOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "deliveryAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockSellerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockSellerOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockSellerOrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MockSellerOrderItem" ADD CONSTRAINT "MockSellerOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MockSellerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
