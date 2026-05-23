-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'DORMITORY');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "roomType" "RoomType";

-- CreateIndex
CREATE INDEX "Property_type_roomType_city_price_idx" ON "Property"("type", "roomType", "city", "price");
