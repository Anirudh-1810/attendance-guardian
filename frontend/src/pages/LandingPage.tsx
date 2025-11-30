import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, CalendarDays, ShieldAlert, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
      title: "Smart Tracking",
      description: "Real-time calculation of attendance percentage and safe-bunk limits."
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-orange-500" />,
      title: "Risk Prediction",
      description: "Get alerted before your attendance drops below the critical threshold."
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-purple-500" />,
      title: "Timetable Import",
      description: "Upload your timetable to automatically set up your subjects and schedule."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: About Section */}
          <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Never fall short on <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Attendance
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Attendance Guardian is your academic safety net. We help you track classes, manage leaves, and calculate exactly how many classes you can afford to miss without affecting your grades.
              </p>
            </div>

            <div className="grid gap-6">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border shadow-sm backdrop-blur-sm hover:shadow-md transition-all">
                  <div className="mt-1 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 pt-4">
               <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity">
                 Get Started <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </div>

          {/* Right Column: Auth Section */}
          <div className="flex justify-center lg:justify-end animate-in slide-in-from-right-10 duration-700 fade-in delay-200">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl ring-1 ring-black/5">
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Enter your details to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="student@university.edu" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleAuth} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First name</Label>
                          <Input id="first-name" placeholder="John" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last name</Label>
                          <Input id="last-name" placeholder="Doe" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="student@university.edu" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" type="password" required />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" type="submit" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 text-center text-xs text-muted-foreground">
                  <p>By continuing, you agree to our Terms of Service.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}