import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import Index from "./pages/Index";
import Domains from "./pages/Domains";
import DomainDetail from "./pages/DomainDetail";
import LevelPage from "./pages/LevelPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Community from "./pages/Community";

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
import ProjectBuilder from "./pages/ProjectBuilder";
import AIVideoInterview from "./pages/AIVideoInterview";
import Hackathons from "./pages/Hackathons";
import VisualBuilderPage from "./visual-builder/pages/VisualBuilderPage";
import AuthEntryModal from "./components/AuthEntryModal";
import GitHubCallback from "./pages/GitHubCallback";
import Assistant from "./pages/Assistant";
import Studio from "./pages/Studio";
import Internships from "./pages/Internships";
import DownloadPage from "./pages/Download";
import NotFound from "./pages/NotFound";
import PopAd from "./components/PopAd";
import OnboardingDialog from "./components/onboarding/OnboardingDialog";
import AssistantLauncher from "./components/assistant/AssistantLauncher";
import LunorLoader from "./components/LunorLoader";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  useVisitorTracking();
  const [booting, setBooting] = useState(() => {
    try {
      return !sessionStorage.getItem("lunor_booted");
    } catch {
      return false; // storage blocked (sandboxed iframe) -> skip the boot loader
    }
  });

  if (booting) {
    return (
      <LunorLoader
        onDone={() => {
          try {
            sessionStorage.setItem("lunor_booted", "1");
          } catch {
            /* ignore storage failure in sandboxed iframe */
          }
          setBooting(false);
        }}
      />
    );
  }


  return (
    <BrowserRouter>
      <PopAd />
      <AuthEntryModal />
      <OnboardingDialog />
      <AssistantLauncher />
      <Routes>
        <Route path="/" element={<Index />} />

        <Route path="/domains" element={<Domains />} />
        <Route path="/domain/:domainId" element={<DomainDetail />} />
        <Route path="/domain/:domainId/level/:levelIndex" element={<LevelPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/community" element={<Community />} />
        
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
        <Route path="/projects" element={<ProjectBuilder />} />
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="/ai-interview" element={<AIVideoInterview />} />
        <Route path="/visual-builder" element={<VisualBuilderPage />} />
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="/github/callback" element={<GitHubCallback />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/assistant/:threadId" element={<Assistant />} />
        <Route path="/studio" element={<Studio />} />
        <Route
          path="/internships"
          element={
            <RequireAuth>
              <Internships />
            </RequireAuth>
          }
        />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
