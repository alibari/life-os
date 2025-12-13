import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TheBlade } from "./TheBlade";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Menu Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 btn-press glass rounded-full h-12 w-12"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* The Blade Sidebar */}
      <TheBlade open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
