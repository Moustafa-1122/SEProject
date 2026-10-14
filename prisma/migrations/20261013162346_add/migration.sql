/*
  Warnings:

  - The primary key for the `clients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP CONSTRAINT "clients_pkey",
DROP COLUMN "id",
ADD COLUMN     "client_id" SERIAL NOT NULL,
ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id");

-- CreateTable
CREATE TABLE "vehicles" (
    "vehicle_id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "plate_number" VARCHAR(20) NOT NULL,
    "make" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "service_type_id" SERIAL NOT NULL,
    "service_name" VARCHAR(255) NOT NULL,
    "interval_month" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("service_type_id")
);

-- CreateTable
CREATE TABLE "service_records" (
    "service_record_id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "service_type_id" INTEGER NOT NULL,
    "service_date" DATE NOT NULL,
    "odometer" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_records_pkey" PRIMARY KEY ("service_record_id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "reminder_id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "service_type_id" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "contacted_date" DATE,
    "last_service_record_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE INDEX "vehicles_client_id_idx" ON "vehicles"("client_id");

-- CreateIndex
CREATE INDEX "service_records_vehicle_id_idx" ON "service_records"("vehicle_id");

-- CreateIndex
CREATE INDEX "service_records_service_type_id_idx" ON "service_records"("service_type_id");

-- CreateIndex
CREATE INDEX "reminders_vehicle_id_idx" ON "reminders"("vehicle_id");

-- CreateIndex
CREATE INDEX "reminders_service_type_id_idx" ON "reminders"("service_type_id");

-- CreateIndex
CREATE INDEX "reminders_due_date_idx" ON "reminders"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("service_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("service_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_last_service_record_id_fkey" FOREIGN KEY ("last_service_record_id") REFERENCES "service_records"("service_record_id") ON DELETE SET NULL ON UPDATE CASCADE;
