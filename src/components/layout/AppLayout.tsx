import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TheBlade } from "./TheBlade";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Persistent Sidebar */}
      <TheBlade collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
