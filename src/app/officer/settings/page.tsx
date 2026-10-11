import { OfficerSettingsView } from "@/components/officer/settings/OfficerSettingsView";
import { getOfficerProfile } from "@/services/officer-directory-service";

export const dynamic = "force-dynamic";

export default async function OfficerSettingsPage() {
  const officer = await getOfficerProfile();
  return <OfficerSettingsView officer={officer} />;
}
