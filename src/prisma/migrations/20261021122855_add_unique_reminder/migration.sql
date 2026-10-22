/*
  Warnings:

  - A unique constraint covering the columns `[vehicle_id,service_type_id]` on the table `reminders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reminders_vehicle_id_service_type_id_key" ON "reminders"("vehicle_id", "service_type_id");
