import { getSettings } from "@/lib/settings-db";
import { SettingsForm } from "@/ui/forms/settings-form";

export default function Settings() {

  const settings = getSettings(1);

  return (
    <div>
      <SettingsForm settings={settings} />
    </div>
  );
}
