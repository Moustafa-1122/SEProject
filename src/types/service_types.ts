import z from "zod";


export const serviceValidatiomSchema = z.object({
    service_name: z.string().trim().min(1, "Name too short").max(50, "Name too long"),
    interval_month:z.number().int().min(1,"at least 1 month"),
})
export type ServiceSchema = z.infer<typeof serviceValidatiomSchema>;