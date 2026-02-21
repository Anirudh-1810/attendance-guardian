import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Attendance Guardian
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4">
                    <a href="#features" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">Features</Button>
                    </a>
                    <a href="#reviews" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">Reviews</Button>
                    </a>
                    <a href="#faq" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">FAQ</Button>
                    </a>
                    <div className="h-px bg-border my-2" />
                    <a href="#login-card" className="w-full">
                      <Button variant="outline" className="w-full justify-start">Login</Button>
                    </a>
                    <a href="#login-card" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white justify-start">
                        Sign Up
                      </Button>
                    </a>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

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
