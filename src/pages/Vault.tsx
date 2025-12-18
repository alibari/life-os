import { PageHeader } from "@/components/layout/PageHeader";
import { Settings } from "lucide-react";

export default function Vault() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <PageHeader
        title="VAULT"
        subtitle="SETTINGS"
        icon={Settings}
        className="w-full"
      />
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground">Coming in Phase 9</p>
      </div>
    </div>
  );
}
