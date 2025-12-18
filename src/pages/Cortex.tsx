import { PageHeader } from "@/components/layout/PageHeader";
import { Brain } from "lucide-react";

export default function Cortex() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <PageHeader
        title="CORTEX"
        subtitle="NOTES"
        icon={Brain}
        className="w-full"
      />
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground">Coming in Phase 7</p>
      </div>
    </div>
  );
}
