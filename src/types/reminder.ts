import z from "zod";


export const postponeReminderSchema  = z.object({
  due_date: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
  .refine((v) => {
    const d = new Date(v);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return !isNaN(d.getTime()) && d >= today;
  }, "Due date cannot be in the past"),
})
export type PostponeReminder = z.infer<typeof postponeReminderSchema>;