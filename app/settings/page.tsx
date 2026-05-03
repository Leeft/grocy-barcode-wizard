import { getSettings } from "@/lib/settings-db";
import { getApiKeys } from "@/lib/user-db";
import { SettingsForm } from "@/ui/forms/settings-form";

export default function Settings() {
  return (
    <div>
      <SettingsForm settings={getSettings(1)} apiKeys={getApiKeys(1)} />
    </div>
  );
}
