-- CreateEnum
CREATE TYPE "BuyerStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- AlterTable
ALTER TABLE "Buyer"
ADD COLUMN "status" "BuyerStatus" NOT NULL DEFAULT 'ACTIVE';
