import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import WarRoom from "@/pages/WarRoom";
import Lab from "@/pages/Lab";
import NorthStar from "@/pages/NorthStar";
import Mirror from "@/pages/Mirror";
import Cortex from "@/pages/Cortex";
import Oracle from "@/pages/Oracle";
import Vault from "@/pages/Vault";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/war-room" element={<WarRoom />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/north-star" element={<NorthStar />} />
            <Route path="/mirror" element={<Mirror />} />
            <Route path="/cortex" element={<Cortex />} />
            <Route path="/oracle" element={<Oracle />} />
            <Route path="/vault" element={<Vault />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
