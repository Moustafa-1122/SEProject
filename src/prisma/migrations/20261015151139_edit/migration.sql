/*
  Warnings:

  - A unique constraint covering the columns `[mobile_number]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clients_mobile_number_key" ON "clients"("mobile_number");
