import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AttendanceProvider } from "@/contexts/AttendanceContext";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import SubjectDetail from "./pages/SubjectDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import { Analytics } from "@vercel/analytics/next"

import React, { Suspense } from "react";
const LatticeBackground = React.lazy(() => import("@/components/LatticeBackground"));

const queryClient = new QueryClient();

const App = () => {
  return (
    // enableSystem ensures it respects OS preference, class attribute for Tailwind
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <LatticeBackground />
        </Suspense>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
              <AuthProvider>
                <AttendanceProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Landing Page as default route */}
                      <Route path="/" element={<LandingPage />} />

                      {/* Dashboard moved to its own route */}
                      <Route path="/dashboard" element={<Dashboard />} />

                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/subject/:id" element={<SubjectDetail />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </AttendanceProvider>
              </AuthProvider>
            </GoogleOAuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;