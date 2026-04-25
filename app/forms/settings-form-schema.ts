import { z } from "zod/v4";

export const SettingsFormSchema = z.object({
  openCameraByDefault: z.coerce.boolean(),
  playSoundOnScan: z.coerce.boolean(),
});
