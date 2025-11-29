import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import SetupWizard from "./pages/SetupWizard";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("onboarded") === "true";
  });

  useEffect(() => {
    if (isOnboarded) {
      localStorage.setItem("onboarded", "true");
    }
  }, [isOnboarded]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/setup" element={<SetupWizard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={isOnboarded ? <Dashboard /> : <Navigate to="/setup" replace />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/subject/:id" element={<SubjectDetail />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
