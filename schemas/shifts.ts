import { z } from "zod";
//added dependency: schema declaration and data validation libraryç
export const meetingFormSchema = z.object({
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  shiftName: z.string().min(1, { message: "Shift name is required" }),
  shiftDate: z.string().min(1, { message: "Shift date is required" }),
  workerIds: z
    .array(z.string())
    .min(1, { message: "At least one worker must be selected" }),
});
