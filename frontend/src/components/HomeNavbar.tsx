import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function HomeNavbar() {
  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all hover:scale-105">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Attendance Guardian
              </h1>
            </div>
          </Link>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-2 items-center">
              <a href="#features">
                <Button variant="ghost">Features</Button>
              </a>
              <a href="#reviews">
                <Button variant="ghost">Reviews</Button>
              </a>
              <a href="#faq">
                <Button variant="ghost">FAQ</Button>
              </a>
            </nav>

            <div className="h-6 w-px bg-border hidden md:block" />

            <div className="flex items-center gap-2">
              <a href="#login-card">
                <Button variant="outline" size="sm">Login</Button>
              </a>
              <a href="#login-card">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Sign Up
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
