import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Domains from "./pages/Domains";
import DomainDetail from "./pages/DomainDetail";
import Dashboard from "./pages/Dashboard";
import Mentors from "./pages/Mentors";
import GuidanceRoadmap from "./pages/GuidanceRoadmap";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Pricing from "./pages/Pricing";
import AdminPanel from "./pages/AdminPanel";
import DailyChallenge from "./pages/DailyChallenge";
import Achievements from "./pages/Achievements";
import SkillRadar from "./pages/SkillRadar";
import ResumeBuilder from "./pages/ResumeBuilder";
import PromoVideo from "./pages/PromoVideo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/domain/:domainId" element={<DomainDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/guidance" element={<GuidanceRoadmap />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/challenge/:domainId" element={<DailyChallenge />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/skill-radar" element={<SkillRadar />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/promo" element={<PromoVideo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
