import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart3, 
  CalendarDays, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Upload, 
  Ban, 
  Bell, 
  Eye, 
  EyeOff, 
  Play, 
  Star, 
  Lock, 
  Zap, 
  HelpCircle,
  GraduationCap
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const testimonials = [
    {
      quote: "Helped me avoid detention twice this semester. Essential tool.",
      author: "Alex R., 3rd Year CSE"
    },
    {
      quote: "The timetable auto-import saved so much time. Literally magic.",
      author: "Sarah M., BBA Student"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden relative">
      
      {/* 9. Light Background Animations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Navbar />

      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Hero & Features */}
          <div className="space-y-10 animate-in slide-in-from-left-10 duration-700 fade-in">
            <div className="space-y-6">
              <div className="relative">
                {/* 2. Visual Illustration / Hero Graphic (Abstract CSS) */}
                <div className="absolute -left-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl -z-10"></div>
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                  Never fall short on <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Attendance
                  </span>
                </h1>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Attendance Guardian is your academic safety net. We help you track classes, manage leaves, and calculate exactly how many classes you can afford to miss.
              </p>

              {/* 10. CTA Split */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 hover:scale-105 transition-all shadow-lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="hover:bg-accent/50 hover:scale-105 transition-all gap-2">
                  <Play className="h-4 w-4" /> Watch Demo
                </Button>
              </div>

              {/* 3. Trust Indicators */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium pt-2">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Trusted by 5,000+ students</span>
                <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-blue-500" /> Private & Secure</span>
                <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-orange-500" /> Instant Predictions</span>
              </div>
            </div>

            {/* 1. How It Works Stepper */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">How It Works</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Upload, label: "Upload Timetable" },
                  { icon: Ban, label: "Add Leaves" },
                  { icon: Bell, label: "Get Alerts" }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center space-y-2 group cursor-default">
                    <div className="h-10 w-10 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors flex items-center justify-center relative">
                      <step.icon className="h-5 w-5 text-primary" />
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border text-[10px] flex items-center justify-center font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                    </div>
                    <span className="text-xs font-medium">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Feature Cards with Micro-Interactions */}
            <div className="grid gap-4">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 border shadow-sm backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all duration-300 group cursor-default">
                  <div className="mt-1 p-2 bg-white dark:bg-gray-950 rounded-lg shadow-sm group-hover:ring-2 ring-primary/20 transition-all">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Auth Section */}
          <div className="flex flex-col items-center lg:items-end animate-in slide-in-from-right-10 duration-700 fade-in delay-200 space-y-8">
            {/* 5. Improved Login Card */}
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 relative overflow-hidden">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
              
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>
                  Access your dashboard to track attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <Button variant="outline" className="w-full gap-2 hover:bg-slate-50 dark:hover:bg-slate-800" type="button" onClick={handleAuth}>
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.2833 0 4.2333.8167 5.7667 2.15l-1.8 1.8c-1.05-1-2.4333-1.6333-3.9667-1.6333-3.4166 0-6.1833 2.7667-6.1833 6.1833 0 3.4167 2.7667 6.1833 6.1833 6.1833 2.9167 0 5.4167-2.0333 5.95-4.8H12.0003v-2.3h8.3333c.1.5333.1334 1.0833.1334 1.6333 0 4.8667-3.2334 8.7833-8.4667 8.7833z" fill="currentColor" /></svg>
                      Continue with Google
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="student@university.edu" 
                          list="email-domains"
                          required 
                        />
                        <datalist id="email-domains">
                          <option value="@student.university.edu" />
                          <option value="@gmail.com" />
                          <option value="@outlook.com" />
                        </datalist>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                        </div>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            className="pr-10"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md" type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    <Button variant="outline" className="w-full gap-2" type="button" onClick={handleAuth}>
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.2833 0 4.2333.8167 5.7667 2.15l-1.8 1.8c-1.05-1-2.4333-1.6333-3.9667-1.6333-3.4166 0-6.1833 2.7667-6.1833 6.1833 0 3.4167 2.7667 6.1833 6.1833 6.1833 2.9167 0 5.4167-2.0333 5.95-4.8H12.0003v-2.3h8.3333c.1.5333.1334 1.0833.1334 1.6333 0 4.8667-3.2334 8.7833-8.4667 8.7833z" fill="currentColor" /></svg>
                      Continue with Google
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
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
                        <div className="relative">
                          <Input 
                            id="signup-password" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            className="pr-10"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md" type="submit" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  By continuing, you agree to our Terms of Service.
                </div>
              </CardContent>
            </Card>

            {/* 8. Testimonials Section (Small) */}
            <div className="w-full max-w-md">
              <div className="grid gap-3">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-white/40 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg border border-white/20 text-sm">
                    <p className="italic mb-1">"{t.quote}"</p>
                    <p className="text-xs font-semibold text-muted-foreground text-right">— {t.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 7. Sticky Helper Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full h-14 w-14 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-110 transition-transform p-0">
              <HelpCircle className="h-8 w-8" />
              <span className="sr-only">Help</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" /> 
                Understanding Attendance Risk
              </DialogTitle>
              <DialogDescription>
                We use a smart algorithm to calculate your attendance safety.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Safe Zone</h4>
                  <p className="text-xs text-muted-foreground">Above 85% attendance. You can safely miss a few classes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Warning Zone</h4>
                  <p className="text-xs text-muted-foreground">Near the threshold. We'll alert you to attend next classes.</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* 12. Footer */}
      <footer className="border-t bg-white/50 dark:bg-black/20 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Attendance Guardian
              </h3>
              <p className="text-xs text-muted-foreground">
                Helping students manage their academic life with smart attendance tracking and risk prediction.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Product</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">Features</li>
                <li className="hover:text-foreground cursor-pointer">Pricing</li>
                <li className="hover:text-foreground cursor-pointer">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Support</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">Help Center</li>
                <li className="hover:text-foreground cursor-pointer">Contact Us</li>
                <li className="hover:text-foreground cursor-pointer">Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Legal</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">Privacy Policy</li>
                <li className="hover:text-foreground cursor-pointer">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground flex justify-between items-center">
            <p>© 2024 Attendance Guardian. All rights reserved.</p>
            <p>v1.0.0 (Beta)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}