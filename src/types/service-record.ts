import z from "zod";

export const serviceRecordSchema = z.object({
  service_type_id: z.number().int().positive("service_type_id must be a valid id"),
  service_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "service_date must be a valid date",
  }),
  odometer: z.number().int().min(0, "odometer must be >= 0"),
});

export type ServiceRecord = z.infer<typeof serviceRecordSchema>;