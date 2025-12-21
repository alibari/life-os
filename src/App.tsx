import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SystemBoot } from "@/components/layout/SystemBoot";
import Dashboard from "@/pages/Dashboard";
import FlowState from "@/pages/FlowState";
import Lab from "@/pages/Lab";
import NorthStar from "@/pages/NorthStar";
import Mirror from "@/pages/Mirror";
import Cortex from "@/pages/Cortex";
import Oracle from "@/pages/Oracle";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { LensProvider } from "@/context/LensContext";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Show futuristic boot screen while loading OR while auth is initializing
  // We can also add a minimum display time if needed, but for now, rely on auth loading
  if (loading) {
    return <SystemBoot />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flow-state" element={<FlowState />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/north-star" element={<NorthStar />} />
        <Route path="/mirror" element={<Mirror />} />
        <Route path="/cortex" element={<Cortex />} />
        <Route path="/oracle" element={<Oracle />} />

        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LensProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LensProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
