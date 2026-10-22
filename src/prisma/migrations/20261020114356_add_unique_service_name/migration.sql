/*
  Warnings:

  - A unique constraint covering the columns `[service_name]` on the table `service_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "service_types_service_name_key" ON "service_types"("service_name");
