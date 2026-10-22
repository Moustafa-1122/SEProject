import z, { number } from "zod";

export const zodValidationSchema = z.object({
  name: z.string().trim().min(2,"name is too short").max(250),
  mobile_number: z.string().trim().regex(/^961\d{7,8}$/,"Mobile must be in 961 format, e.g. 96171898929"),
  vehicle: z.object({
    
    plate_number: z.string().trim().min(1, "plate number is required").max(15, "plate number is too long"),
    make: z.string().trim().min(1, "make is required").max(50, "make is too long"),
    model:z.string().min(1, "model is required").max(50, "model is too long"),
    year: z.number().min(1900, "year is too old").max(new Date().getFullYear() + 1, "year is too new"),//new Date().getFullYear() + 1 btjebli l sene yali nehna fiya
  })

})

export const updateClientSchema = z.object({
  name: z.string().trim().min(2, "name is too short").max(250).optional(),
  mobile_number: z.string().trim().regex(/^961\d{7,8}$/, "Mobile must be in 961 format, e.g. 96171898929").optional(),
}).refine(
  (data) => data.name !== undefined || data.mobile_number !== undefined,
  { message: "At least one field (name or mobile_number) must be provided" }
);

export const vehicleSchema = z.object({
   plate_number: z.string().trim().min(1, "plate number is required").max(15, "plate number is too long"),
    make: z.string().trim().min(1, "make is required").max(50, "make is too long"),
    model:z.string().min(1, "model is required").max(50, "model is too long"),
    year: z.number().min(1900, "year is too old").max(new Date().getFullYear() + 1, "year is too new"),
})

export type UpdateClient = z.infer<typeof updateClientSchema>;

export type ClientShema = z.infer<typeof zodValidationSchema>;
export type vehicleSchema = z.infer<typeof vehicleSchema>;
