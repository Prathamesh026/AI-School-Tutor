import { z } from "zod";

export const webhookPayloadSchema = z.object({
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            messages: z
              .array(
                z.object({
                  id: z.string(),
                  from: z.string(),
                  text: z.object({ body: z.string() }).optional(),
                  type: z.string()
                })
              )
              .optional()
          })
        })
      )
    })
  )
});
