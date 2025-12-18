import { PageHeader } from "@/components/layout/PageHeader";
import { Eye } from "lucide-react";

export default function Oracle() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 cockpit-canvas flex flex-col items-center">
      <PageHeader
        title="THE ORACLE"
        subtitle="ANALYTICS"
        icon={Eye}
        className="w-full"
      />
      <div className="card-surface p-6 text-center">
        <p className="text-muted-foreground">Coming in Phase 8</p>
      </div>
    </div>
  );
}
