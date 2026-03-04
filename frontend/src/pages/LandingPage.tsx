import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeNavbar } from "@/components/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Bell,
  ArrowRight,
  Upload,
  Eye,
  EyeOff,
  Play,
  Star,
  Lock,
  Zap,
  GraduationCap,
  MessageCircle,
  Mic,
  Calculator,
  FileText,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Quote,
  Instagram,
  Linkedin,
  Twitter,
  Bug,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { requestOtp, verifyOtp, googleLogin } from "@/api/auth";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function LandingPage() {
  // Google OAuth login handler
  const handleGoogleSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    try {
      const response = await googleLogin({ credential: tokenResponse.credential });
      authLogin(response.token, response.user);
      toast.success(response.message || "Logged in with Google!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [calcClasses, setCalcClasses] = useState([10]);
  const [greeting, setGreeting] = useState("Welcome to Attendance Guardian");

  // OTP Auth State
  const [authStep, setAuthStep] = useState<"email" | "otp">("email");
  const [authEmail, setAuthEmail] = useState("");
  const [authOtp, setAuthOtp] = useState("");



  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !location.state?.fromApp) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setGreeting(`${timeGreeting}, ${userData.name.split(' ')[0]} 👋`);
    } else {
      setGreeting(`${timeGreeting}, Student 👋`);
    }
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestOtp(authEmail);
      toast.success(response.message || "OTP sent successfully!");
      setAuthStep("otp");
    } catch (error: any) {
      if (error instanceof TypeError) {
        toast.error("Connection failed. Please check your internet connection.");
      } else {
        toast.error(error.message || "Failed to send OTP");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authOtp || authOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp(authEmail, authOtp);
      authLogin(response.token, response.user);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error instanceof TypeError) {
        toast.error("Connection failed. Please check your internet connection.");
      } else {
        toast.error(error.message || "Invalid OTP");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reviews Data
  const reviews = [
    {
      name: "Aarav S.",
      role: "CSE, Chitkara University",
      review: "Helped me avoid detention twice this semester. The safe bunk calculator is a life saver!",
      color: "text-blue-400"
    },
    {
      name: "Meera K.",
      role: "BBA, Panjab University",
      review: "The timetable auto-import saved so much time. Literally magic. Highly recommend!",
      color: "text-purple-400"
    },
    {
      name: "Rohan G.",
      role: "Engineering, Chandigarh University",
      review: "I used to track attendance in Excel. This is 100x better and the UI is beautiful.",
      color: "text-green-400"
    },
    {
      name: "Priya S.",
      role: "Medical, GMCH 32",
      review: "Medical leave tracking is spot on. Finally I know my exact percentage accurately.",
      color: "text-orange-400"
    },
    {
      name: "Jaspreet Singh",
      role: "Law, PU",
      review: "The notifications saved me from debarment. The best attendance app out there.",
      color: "text-red-400"
    },
    {
      name: "Ananya M.",
      role: "B.Com, SD College",
      review: "Simple, fast, and accurate. Exactly what I needed for my attendance tracking.",
      color: "text-pink-400"
    },
    {
      name: "Vikram R.",
      role: "B.Tech, Thapar University",
      review: "The UI is so clean and the dark mode is perfect. Love using this app.",
      color: "text-cyan-400"
    },
    {
      name: "Neha D.",
      role: "MBA, UBS",
      review: "Keeps me organized with my busy schedule. A must-have for every student.",
      color: "text-yellow-400"
    }
  ];

  const handleGetStarted = () => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate('/dashboard');
    } else {
      toast.error("Please log in to continue", {
        description: "You need an account to access the dashboard.",
        action: {
          label: "Login",
          onClick: () => document.getElementById('login-email')?.focus()
        }
      });
      // Scroll to login section
      const loginSection = document.getElementById('login-card');
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative font-sans selection:bg-purple-500/30">


      {/* Sticky Benefit Bar */}
      <div className="bg-black/60 text-white/90 text-center py-2 text-xs font-semibold tracking-wide backdrop-blur-md border-b border-white/10 sticky top-0 z-[60]">
        🚀 95% Prediction Accuracy | Works with Image Timetables | Supports DL/ML | Calculates Safe Bunks
      </div>

      <HomeNavbar />

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">

        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-12 md:mb-24">
          <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
            <div className="space-y-6">
              <Badge variant="outline" className="py-1 px-3 border-white/20 text-white bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                ✨ New: AI-Powered Risk Analysis
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight drop-shadow-sm">
                <span className="text-white">{greeting}</span> <br />
                <span className="text-3xl md:text-5xl text-gray-300 font-normal">
                  Ready to check your risk?
                </span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed max-w-lg drop-shadow-md">
                Your academic safety net. We calculate safe bunks, track leaves, and alert you before you hit the detention list.
              </p>

              {/* Quick Attendance Calculator Widget */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(120,119,198,0.1)] max-w-md text-white hover:shadow-[0_0_30px_rgba(120,119,198,0.2)] transition-all duration-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-300">
                    <Calculator className="h-4 w-4" /> Quick Risk Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2 text-gray-300">
                      <span>Missed Classes</span>
                      <span className="font-bold text-red-400">{calcClasses[0]}</span>
                    </div>
                    <Slider
                      defaultValue={[10]}
                      max={30}
                      step={1}
                      onValueChange={setCalcClasses}
                      className="py-2"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-sm text-gray-300">Predicted Attendance:</span>
                    <span className={`text-xl font-bold ${calcClasses[0] > 12 ? 'text-red-400' : 'text-green-400'}`}>
                      {Math.max(0, 100 - (calcClasses[0] * 2))}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white border-0">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" size="lg" className="hover:bg-white/10 hover:scale-105 transition-all gap-2 backdrop-blur-sm bg-white/5 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <Play className="h-4 w-4" /> Watch Demo
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-400 pt-4">
                <span className="flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded text-green-300 border border-green-500/20">
                  <Lock className="h-3 w-3" /> SSL Secured
                </span>
                <span className="flex items-center gap-1 bg-blue-900/20 px-2 py-1 rounded text-blue-300 border border-blue-500/20">
                  <Zap className="h-3 w-3" /> AI Enhanced
                </span>
                <span className="flex items-center gap-1 bg-purple-900/20 px-2 py-1 rounded text-purple-300 border border-purple-500/20">
                  <Star className="h-3 w-3" /> 5k+ Students
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end animate-in slide-in-from-right-10 duration-700 fade-in delay-200 space-y-6">

            {/* Login/Signup Card */}
            <Card id="login-card" className="w-full max-w-md border border-white/10 bg-black/60 backdrop-blur-2xl ring-1 ring-white/10 relative overflow-hidden group shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">Enter details to track attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-2">
                  {authStep === "email" ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="student@university.edu"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                        />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white border-0" type="submit" disabled={isLoading || !authEmail}>
                        {isLoading ? "Sending OTP..." : "Continue with Email"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="otp" className="text-gray-300">Enter OTP</Label>
                          <button type="button" onClick={() => setAuthStep("email")} className="text-xs text-blue-400 hover:underline hover:text-blue-300">
                            Change Email?
                          </button>
                        </div>
                        <Input
                          id="login-otp"
                          name="otp"
                          type="text"
                          placeholder="123456"
                          required
                          maxLength={6}
                          value={authOtp}
                          onChange={(e) => setAuthOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-blue-500/20 text-center tracking-widest font-mono text-xl py-6"
                        />
                        <p className="text-xs text-gray-500 text-center mt-2">
                          We sent a 6-digit code to {authEmail}
                        </p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white border-0" type="submit" disabled={isLoading || authOtp.length !== 6}>
                        {isLoading ? "Verifying..." : "Login securely"}
                      </Button>
                    </form>
                  )}

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-black/40 px-3 text-gray-500 font-medium">Or</span></div>
                  </div>

                  <div className="flex justify-center w-full">
                    <GoogleLogin
                      onSuccess={(credentialResponse: CredentialResponse) => {
                        if (credentialResponse.credential) {
                          handleGoogleSuccess(credentialResponse);
                        }
                      }}
                      onError={() => toast.error("Google Sign-In failed. Please try again.")}
                      theme="filled_black"
                      size="large"
                      width="100%"
                      text="continue_with"
                      shape="rectangular"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Subject Snapshot */}
            <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.08)] animate-pulse-slow hover:-translate-y-1 transition-transform duration-500">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase text-gray-400">Live Snapshot</span>
                <Badge variant="outline" className="text-[10px] h-5 border-green-500/30 text-green-400 bg-green-500/10">Active</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-200">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span>DBMS</span>
                  </div>
                  <span className="font-mono font-bold text-green-400">92%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[92%] shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                </div>
                <div className="flex items-center justify-between text-sm pt-1">
                  <div className="flex items-center gap-2 text-gray-200">
                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    <span>Maths</span>
                  </div>
                  <span className="font-mono font-bold text-orange-400">74%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[74%] shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT REVIEWS (MARQUEE) */}
        <div className="mb-12 md:mb-24 overflow-hidden">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Student Voices</h2>

          <div className="relative w-full">
            <div className="flex gap-6 animate-marquee w-max hover:[animation-play-state:paused]">
              {[...reviews, ...reviews].map((review, index) => (
                <Card key={index} className="w-[350px] shrink-0 bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    <Quote className={`h-8 w-8 ${review.color} opacity-50`} />
                    <p className="text-sm text-gray-300 flex-1 leading-relaxed">"{review.review}"</p>
                    <div className="pt-4 border-t border-white/5">
                      <p className={`font-bold ${review.color}`}>{review.name}</p>
                      <p className="text-xs text-gray-500">{review.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 md:mb-24">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <Bell className="h-5 w-5 text-blue-400" /> Smart Alerts
            </h3>
            <Card className="bg-orange-950/30 border-orange-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <CardContent className="p-4 flex gap-4 items-start">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-orange-200">Attendance Risk Alert</p>
                  <p className="text-xs text-orange-300/80 mt-1">
                    Your attendance in DBMS is approaching the danger zone (78%). Consider attending the next 2 lectures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 text-blue-400" /> Seamless Integrations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <ImageIcon className="h-5 w-5 text-blue-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-200">OCR Import</p>
                  <p className="text-xs text-gray-500">Upload Image</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px] h-5 bg-blue-500/10 text-blue-300 border-blue-500/20">COMING SOON</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <FileText className="h-5 w-5 text-red-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-200">PDF Parser</p>
                  <p className="text-xs text-gray-500">Drag & Drop</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px] h-5 bg-blue-500/10 text-blue-300 border-blue-500/20">COMING SOON</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <CalendarIcon className="h-5 w-5 text-green-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-200">G-Calendar</p>
                  <p className="text-xs text-gray-500">Sync Events</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px] h-5 bg-blue-500/10 text-blue-300 border-blue-500/20">COMING SOON</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 opacity-60">
                <GraduationCap className="h-5 w-5 text-purple-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-200">Portal Sync</p>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison (Glass Table) */}
        <div className="mb-12 md:mb-24">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Choose Us?</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 uppercase text-xs text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-bold">Feature</th>
                  <th className="px-6 py-4 text-center">Others</th>
                  <th className="px-6 py-4 text-center text-blue-400 font-bold bg-blue-500/10">Attendance Guardian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {[
                  "Smart Risk Prediction", "Duty/Medical Leave Support", "Timetable OCR Import", "Multi-Subject Analytics", "Safe Bunk Calculator"
                ].map((feature, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{feature}</td>
                    <td className="px-6 py-4 text-center text-gray-600"><XCircle className="h-5 w-5 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-green-400 bg-blue-500/5"><CheckCircle2 className="h-5 w-5 mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* College/Global Stats - ADDED BACK */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 md:mb-24 text-center">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/30 transition-colors">
            <p className="text-3xl font-bold text-blue-400 mb-1">82%</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Attendance</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-colors">
            <p className="text-3xl font-bold text-purple-400 mb-1">Friday</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Most Bunked Day</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-colors">
            <p className="text-3xl font-bold text-green-400 mb-1">12k+</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Leaves Tracked</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-orange-500/30 transition-colors">
            <p className="text-3xl font-bold text-orange-400 mb-1">Zero</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Detentions (User Avg)</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-12 md:mb-24">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-white/10">
              <AccordionTrigger className="text-gray-200 hover:text-white">How is the risk score calculated?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                We use a weighted algorithm that considers your current percentage, remaining classes in the semester, and your college's minimum requirement.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-white/10">
              <AccordionTrigger className="text-gray-200 hover:text-white">Does it store my college login?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                No! We are privacy-first. You don't need to link your college portal. You simply upload your timetable or enter data manually.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b border-white/10">
              <AccordionTrigger className="text-gray-200 hover:text-white">Can I track Medical Leaves?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes, you can mark specific days as "Medical Leave" or "Duty Leave". These are calculated differently based on your college's policy settings.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* About Developers (Marquee) */}
        <div className="mb-12 md:mb-24 overflow-hidden">
          <h2 className="text-2xl font-bold text-center mb-12 text-white">Meet the Developers</h2>

          <div className="relative w-full">
            <div className="flex gap-6 animate-marquee w-max hover:[animation-play-state:paused] items-center">
              {[
                { name: "Anirudh Sharma", role: "Full Stack Developer", socials: { instagram: "#", linkedin: "#", twitter: "#" } },
                { name: "Sagar Chhikara", role: "Frontend Developer", socials: { instagram: "#", linkedin: "#", twitter: "#" } },
                { name: "Bhuvnesh", role: "Backend Developer", socials: { instagram: "#", linkedin: "#", twitter: "#" } },
                { name: "Chirag Dawra", role: "UI/UX Designer", socials: { instagram: "#", linkedin: "#", twitter: "#" } },
                { name: "Anirudh Sharma", role: "Full Stack Developer", socials: { instagram: "#", linkedin: "#", twitter: "#" } },
                { name: "Sagar Chhikara", role: "Frontend Developer", socials: { instagram: "#", linkedin: "#", twitter: "#" } },
                { name: "Bhuvnesh", role: "Backend Developer", socials: { instagram: "#", linkedin: "#", twitter: "#" } },
                { name: "Chirag Dawra", role: "UI/UX Designer", socials: { instagram: "#", linkedin: "#", twitter: "#" } }
              ].map((dev, index) => (
                <Card key={index} className="w-[350px] shrink-0 bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="p-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-col items-start text-left gap-2 flex-1">
                      <div>
                        <p className="font-bold text-lg text-white">{dev.name}</p>
                        <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">{dev.role}</p>
                      </div>

                      <div className="flex gap-3 mt-1">
                        <a href={dev.socials.instagram} className="text-gray-400 hover:text-pink-500 transition-colors">
                          <Instagram className="h-4 w-4" />
                        </a>
                        <a href={dev.socials.linkedin} className="text-gray-400 hover:text-blue-500 transition-colors">
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a href={dev.socials.twitter} className="text-gray-400 hover:text-white transition-colors">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-white/20 shadow-lg group-hover:border-blue-500/50 transition-colors">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.name}`}
                        alt={dev.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md mt-auto relative z-10 w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
                <GraduationCap className="h-4 w-4 text-blue-400" /> Attendance Guardian
              </h3>
              <p className="text-xs text-gray-500 mb-6 max-w-xs">
                Designed & built to help students manage their academic life effortlessly.
              </p>

              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 h-9 text-xs transition-colors bg-transparent shadow-none" onClick={() => window.location.href = 'mailto:support@attendanceguardian.com?subject=Bug Report'}>
                <Bug className="h-3.5 w-3.5" /> Report a Bug
              </Button>
            </div>

            <div className="col-span-1 md:col-span-3">
              <h4 className="font-semibold text-sm mb-5 text-gray-300">Meet the Team</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "Anirudh Sharma", role: "Full Stack Developer", email: "anirudh@example.com", linkedin: "https://linkedin.com/" },
                  { name: "Sagar Chhikara", role: "Frontend Developer", email: "sagar@example.com", linkedin: "https://linkedin.com/" },
                  { name: "Bhuvnesh", role: "Backend Developer", email: "bhuvnesh@example.com", linkedin: "https://linkedin.com/" },
                  { name: "Chirag Dawra", role: "UI/UX Designer", email: "chirag@example.com", linkedin: "https://linkedin.com/" }
                ].map((dev, i) => (
                  <div key={i} className="flex flex-col space-y-1.5">
                    <p className="text-sm font-medium text-gray-200">{dev.name}</p>
                    <p className="text-xs text-blue-400 mb-1">{dev.role}</p>
                    <div className="flex gap-3 pt-1">
                      <a href={`mailto:${dev.email}`} title="Email" className="text-gray-500 hover:text-white transition-colors duration-200">
                        <Mail className="h-4 w-4" />
                      </a>
                      <a href={dev.linkedin} title="LinkedIn" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors duration-200">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center flex flex-col items-center gap-2 text-xs text-gray-600">
            <p>© 2024 Attendance Guardian. All rights reserved.</p>
            <p>v1.2.0 (Beta)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}