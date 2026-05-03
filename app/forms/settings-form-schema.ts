import { z } from "zod/v4";

export const SettingsFormSchema = z
  .object({
    openCameraByDefault: z.coerce.boolean(),
    playSoundOnScan: z.coerce.boolean(),
    apiKeys: z
      .array(
        z.object({
          id: z.number().gt(0).optional(),
          apiKey: z.string().min(12),
          created: z.date().optional(),
          delete: z.boolean().optional(),
        }),
      )
      .min(1),
  })
  .superRefine(({ apiKeys }, ctx) => {
    const validKeys = apiKeys.filter((key) => key.delete === undefined).length;
    if (validKeys <= 0) {
      ctx.addIssue({
        code: "custom",
        message: `You must have at least one API key`,
        input: "apiKeys",
        path: ["apiKeys"],
      });
    }
    return;
  });
