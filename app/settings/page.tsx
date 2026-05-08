import { getSettings } from "@/lib/settings-db";
import { getApiKeys } from "@/lib/user-db";
import { SettingsForm } from "@/ui/forms/settings-form";
import { connection } from "next/server";

export default async function Settings() {
  await connection();
  return (
    <div>
      <SettingsForm settings={getSettings(1)} apiKeys={getApiKeys(1)} />
    </div>
  );
}
