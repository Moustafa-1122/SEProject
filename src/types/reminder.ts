import z from "zod";


export const postponeReminderSchema  = z.object({
    due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "due_date must be a valid date",
      }),
})
export type PostponeReminder = z.infer<typeof postponeReminderSchema>;