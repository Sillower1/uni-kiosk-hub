import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { KioskLayout } from "@/components/KioskLayout";
import HomePage from "./pages/HomePage";
import PhotoPage from "./pages/PhotoPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import MapPage from "./pages/MapPage";
import SchedulePage from "./pages/SchedulePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <KioskLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/photo" element={<PhotoPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </KioskLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
