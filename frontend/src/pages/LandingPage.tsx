import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import LatticeBackground from "@/components/LatticeBackground";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Quote
} from "lucide-react";
import { toast } from "sonner";

export default function LandingPage() {
  const handleAuth = () => {
    // Implement authentication logic here
  };
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [calcClasses, setCalcClasses] = useState([10]);
  const [greeting, setGreeting] = useState("Welcome to Attendance Guardian");

  // Signup State
  const [signupData, setSignupData] = useState({
    name: "",
    course: "",
    universityNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Login State
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

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

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [e.target.id]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock Login Logic
    setTimeout(() => {
      // For demo, we'll just create a mock user if the email matches "student@university.edu"
      // In a real app, this would verify against a backend
      if (loginData.email) {
        const mockUser = {
            name: "Demo Student",
            email: loginData.email,
            course: "Computer Science",
            universityNumber: "12345678"
        };
        localStorage.setItem("user", JSON.stringify(mockUser));
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
          toast.error("Please enter an email");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser = {
        name: signupData.name,
        email: signupData.email,
        course: signupData.course,
        universityNumber: signupData.universityNumber
      };
      
      localStorage.setItem("user", JSON.stringify(newUser));
      toast.success("Account created successfully!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  // Reviews Data (15 items for smooth marquee)
  const reviews = [
    { name: "Alex R.", role: "CSE Student", review: "Helped me avoid detention twice this semester. The safe bunk calculator is a life saver!", color: "text-blue-400" },
    { name: "Sarah M.", role: "BBA Student", review: "The timetable auto-import saved so much time. Literally magic. Highly recommend!", color: "text-purple-400" },
    { name: "Rahul K.", role: "Engineering", review: "I used to track attendance in Excel. This is 100x better and the UI is beautiful.", color: "text-green-400" },
    { name: "Priya S.", role: "Medical Student", review: "Medical leave tracking is spot on. Finally I know my exact percentage accurately.", color: "text-orange-400" },
    { name: "Jason D.", role: "Law Student", review: "The notifications saved me from debarment. The best attendance app out there.", color: "text-red-400" },
    { name: "Emily W.", role: "Psychology", review: "Stress level went down 100%. I know exactly when I can sleep in.", color: "text-pink-400" },
    { name: "Michael B.", role: "Civil Eng", review: "Simple, fast, and looks amazing on dark mode. Love the universe theme!", color: "text-blue-300" },
    { name: "Lisa T.", role: "Arts", review: "Calculates everything for me. I just check the dashboard once a week.", color: "text-yellow-400" },
    { name: "David H.", role: "MBA", review: "Professional grade tracking. The analytics view helps me plan my semester leaves.", color: "text-indigo-400" },
    { name: "Jessica L.", role: "Biotech", review: "Setup took like 30 seconds with the timetable image upload.", color: "text-teal-400" },
    { name: "Tom P.", role: "History", review: "No more manual math. It tells me 'You can bunk 3 more' and that's all I need.", color: "text-cyan-400" },
    { name: "Ryan G.", role: "Physics", review: "The duty leave feature is something no other app has. Essential for sports students.", color: "text-rose-400" },
    { name: "Anita D.", role: "Chemistry", review: "Works perfectly on my phone. I check it right before deciding to skip a class.", color: "text-violet-400" },
    { name: "Kevin S.", role: "Mathematics", review: "Accurate to the decimal. I trust this more than my college portal.", color: "text-emerald-400" },
    { name: "Olivia R.", role: "Economics", review: "Saved my grades. I realized I was at 74% just in time to recover.", color: "text-amber-400" }
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative font-sans selection:bg-purple-500/30">
      
      {/* ANIMATED LATTICE BACKGROUND */}
      <LatticeBackground />

      {/* Sticky Benefit Bar */}
      <div className="bg-black/60 text-white/90 text-center py-2 text-xs font-semibold tracking-wide backdrop-blur-md border-b border-white/10 sticky top-0 z-[60]">
        🚀 95% Prediction Accuracy | Works with Image Timetables | Supports DL/ML | Calculates Safe Bunks
      </div>

      <Navbar />

      <main className="container mx-auto px-4 py-12 relative z-10">
        
        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
            <div className="space-y-6">
              <Badge variant="outline" className="py-1 px-3 border-white/20 text-white bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                ✨ New: AI-Powered Risk Analysis
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 drop-shadow-sm">
                {greeting} <br />
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
                <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white border-0">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" size="lg" className="hover:bg-white/10 hover:scale-105 transition-all gap-2 backdrop-blur-sm bg-white/5 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <Play className="h-4 w-4" /> Watch Demo
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end animate-in slide-in-from-right-10 duration-700 fade-in delay-200 space-y-6">
            
            {/* Login/Signup Card */}
            <Card className="w-full max-w-md border border-white/10 bg-black/60 backdrop-blur-2xl ring-1 ring-white/10 relative overflow-hidden group shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">Enter details to track attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5">
                    <TabsTrigger value="login" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="student@university.edu" 
                          required 
                          value={loginData.email}
                          onChange={handleLoginChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-gray-300">Password</Label>
                          <a href="#" className="text-xs text-blue-400 hover:underline hover:text-blue-300">Forgot?</a>
                        </div>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            value={loginData.password}
                            onChange={handleLoginChange}
                            className="pr-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white border-0" type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-black/40 px-2 text-gray-500">Or</span></div>
                    </div>
                    <Button variant="outline" className="w-full gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10" type="button" onClick={handleAuth}>
                      <span className="font-bold">G</span> Continue with Google
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                       <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                        <Input id="name" placeholder="John Doe" required value={signupData.name} onChange={handleSignupChange} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="course" className="text-gray-300">Course</Label>
                          <Input id="course" placeholder="B.Tech CSE" required value={signupData.course} onChange={handleSignupChange} className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="universityNumber" className="text-gray-300">Univ. ID</Label>
                          <Input id="universityNumber" placeholder="12345678" required value={signupData.universityNumber} onChange={handleSignupChange} className="bg-white/5 border-white/10 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <Input id="email" type="email" placeholder="student@university.edu" required value={signupData.email} onChange={handleSignupChange} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-gray-300">Password</Label>
                          <Input id="password" type="password" required value={signupData.password} onChange={handleSignupChange} className="bg-white/5 border-white/10 text-white" />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-gray-300">Confirm</Label>
                          <Input id="confirmPassword" type="password" required value={signupData.confirmPassword} onChange={handleSignupChange} className="bg-white/5 border-white/10 text-white" />
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white border-0" type="submit" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Sign Up"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
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

        {/* STUDENT REVIEWS MARQUEE */}
        <div className="mb-24 overflow-hidden">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Student Voices</h2>
          
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-marquee">
              {/* Reviews repeated twice for marquee effect */}
              {[...reviews, ...reviews].map((review, index) => (
                <div key={index} className="mx-4">
                   <Card className="w-[350px] h-[200px] bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all shadow-lg flex-shrink-0">
                    <CardContent className="p-6 flex flex-col gap-4 h-full">
                      <Quote className={`h-8 w-8 ${review.color} opacity-50`} />
                      <p className="text-sm text-gray-300 flex-1 leading-relaxed line-clamp-3">"{review.review}"</p>
                      <div className="pt-4 border-t border-white/5">
                        <p className={`font-bold ${review.color}`}>{review.name}</p>
                        <p className="text-xs text-gray-500">{review.role}</p> 
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer... (Standard footer structure) */}
         <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md mt-auto relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-white">
                  <GraduationCap className="h-4 w-4 text-blue-400" /> Attendance Guardian
                </h3>
                <p className="text-xs text-gray-500">
                  Helping students manage their academic life.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-gray-300">Product</h4>
                <ul className="text-xs space-y-2 text-gray-500">
                  <li className="hover:text-blue-400 cursor-pointer transition-colors">Features</li>
                  <li className="hover:text-blue-400 cursor-pointer transition-colors">Pricing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 text-gray-300">Legal</h4>
                <ul className="text-xs space-y-2 text-gray-500">
                  <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy</li>
                  <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-gray-600">
              <p>© 2024 Attendance Guardian. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}