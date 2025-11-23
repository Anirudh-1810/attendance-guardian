import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubjectCard } from "@/components/SubjectCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

type SubjectStatus = "safe" | "warning" | "high" | "critical";
type SurpriseLevel = "low" | "medium" | "high";

const mockSubjects: Array<{
  id: number;
  name: string;
  code: string;
  teacher: string;
  attendance: number;
  required: number;
  status: SubjectStatus;
  surpriseLevel: SurpriseLevel;
  canBunk: number;
  mustAttend: number;
}> = [
  {
    id: 1,
    name: "Data Structures",
    code: "CS201",
    teacher: "Dr. Sarah Johnson",
    attendance: 88,
    required: 75,
    status: "safe",
    surpriseLevel: "low",
    canBunk: 3,
    mustAttend: 0,
  },
  {
    id: 2,
    name: "Database Management",
    code: "CS202",
    teacher: "Prof. Michael Chen",
    attendance: 72,
    required: 75,
    status: "warning",
    surpriseLevel: "medium",
    canBunk: 0,
    mustAttend: 2,
  },
  {
    id: 3,
    name: "Operating Systems",
    code: "CS203",
    teacher: "Dr. Emily Brown",
    attendance: 68,
    required: 75,
    status: "high",
    surpriseLevel: "high",
    canBunk: 0,
    mustAttend: 4,
  },
  {
    id: 4,
    name: "Computer Networks",
    code: "CS204",
    teacher: "Prof. David Lee",
    attendance: 92,
    required: 75,
    status: "safe",
    surpriseLevel: "low",
    canBunk: 5,
    mustAttend: 0,
  },
];

export default function Subjects() {
  const navigate = useNavigate();
  const [subjects] = useState(mockSubjects);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">All Subjects</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onClick={() => navigate(`/subject/${subject.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
