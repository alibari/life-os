import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TheBlade } from "./TheBlade";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      {/* Persistent Sidebar */}
      <TheBlade collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth">
        <Outlet />
      </main>
    </div>
  );
}
