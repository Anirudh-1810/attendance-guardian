import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface WhatIfCalculatorProps {
  subject: {
    id: string;
    name: string;
    attendedClasses: number;
    totalClasses: number;
    requiredPercentage: number;
  };
}

export default function WhatIfCalculator({ subject }: WhatIfCalculatorProps) {
  const [mode, setMode] = useState<"add" | "subtract">("add");
  const [hypotheticalClasses, setHypotheticalClasses] = useState(0);

  const currentAttendance = Math.round(
    (subject.attendedClasses / subject.totalClasses) * 100
  );

  // Calculate hypothetical attendance
  const calculateHypothetical = () => {
    if (mode === "add") {
      // Adding classes (assuming all attended)
      const newAttended = subject.attendedClasses + hypotheticalClasses;
      const newTotal = subject.totalClasses + hypotheticalClasses;
      return {
        attended: newAttended,
        total: newTotal,
        percentage: newTotal > 0 ? Math.round((newAttended / newTotal) * 100) : 0,
      };
    } else {
      // Subtracting classes (assuming all bunked)
      const newTotal = subject.totalClasses + hypotheticalClasses;
      return {
        attended: subject.attendedClasses,
        total: newTotal,
        percentage: newTotal > 0 ? Math.round((subject.attendedClasses / newTotal) * 100) : 0,
      };
    }
  };

  const hypothetical = calculateHypothetical();
  const difference = hypothetical.percentage - currentAttendance;

  const reset = () => {
    setHypotheticalClasses(0);
  };

  const increment = () => {
    setHypotheticalClasses((prev) => prev + 1);
  };

  const decrement = () => {
    setHypotheticalClasses((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">What If Calculator</h3>
            <p className="text-sm text-muted-foreground">
              Simulate future attendance scenarios without affecting your actual data
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === "add" ? "default" : "outline"}
              onClick={() => {
                setMode("add");
                setHypotheticalClasses(0);
              }}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Attend Classes
            </Button>
            <Button
              variant={mode === "subtract" ? "default" : "outline"}
              onClick={() => {
                setMode("subtract");
                setHypotheticalClasses(0);
              }}
              className="flex-1"
            >
              <Minus className="h-4 w-4 mr-2" />
              Bunk Classes
            </Button>
          </div>

          {/* Counter */}
          <Card className="p-6 bg-muted/50">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={decrement}
                disabled={hypotheticalClasses === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {mode === "add" ? "Classes to Attend" : "Classes to Bunk"}
                </p>
                <p className="text-4xl font-bold">{hypotheticalClasses}</p>
              </div>

              <Button variant="outline" size="icon" onClick={increment}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Results */}
          {hypotheticalClasses > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Current */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground mb-2">Current</p>
                  <p className="text-3xl font-bold">{currentAttendance}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {subject.attendedClasses}/{subject.totalClasses} classes
                  </p>
                </Card>

                {/* Hypothetical */}
                <Card
                  className={`p-4 ${
                    hypothetical.percentage >= subject.requiredPercentage
                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  }`}
                >
                  <p className="text-sm text-muted-foreground mb-2">After Simulation</p>
                  <p className="text-3xl font-bold">{hypothetical.percentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hypothetical.attended}/{hypothetical.total} classes
                  </p>
                </Card>
              </div>

              {/* Change Indicator */}
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Change in Attendance</span>
                  <Badge
                    variant={difference >= 0 ? "default" : "destructive"}
                    className="text-lg px-3 py-1"
                  >
                    {difference > 0 ? "+" : ""}
                    {difference}%
                  </Badge>
                </div>
              </Card>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Simulated Attendance</span>
                  <span className="font-semibold">{hypothetical.percentage}%</span>
                </div>
                <Progress value={hypothetical.percentage} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>Required: {subject.requiredPercentage}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Insights */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h4 className="font-semibold mb-2 text-sm">Insights</h4>
                <ul className="space-y-1 text-sm">
                  {mode === "add" ? (
                    <>
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>
                          If you attend the next {hypotheticalClasses} class
                          {hypotheticalClasses !== 1 ? "es" : ""}, your attendance will{" "}
                          {difference >= 0 ? "increase" : "decrease"} to{" "}
                          {hypothetical.percentage}%
                        </span>
                      </li>
                      {hypothetical.percentage >= subject.requiredPercentage ? (
                        <li className="flex items-start gap-2 text-green-600 dark:text-green-400">
                          <span>✓</span>
                          <span>You'll be above the required {subject.requiredPercentage}%</span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                          <span>!</span>
                          <span>
                            You'll still be below the required {subject.requiredPercentage}%
                          </span>
                        </li>
                      )}
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span>•</span>
                        <span>
                          If you bunk the next {hypotheticalClasses} class
                          {hypotheticalClasses !== 1 ? "es" : ""}, your attendance will drop to{" "}
                          {hypothetical.percentage}%
                        </span>
                      </li>
                      {hypothetical.percentage >= subject.requiredPercentage ? (
                        <li className="flex items-start gap-2 text-green-600 dark:text-green-400">
                          <span>✓</span>
                          <span>You'll still be above the required {subject.requiredPercentage}%</span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                          <span>!</span>
                          <span>
                            You'll fall below the required {subject.requiredPercentage}%
                          </span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </Card>

              {/* Reset Button */}
              <Button variant="outline" onClick={reset} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Simulation
              </Button>
            </div>
          )}

          {hypotheticalClasses === 0 && (
            <Card className="p-8 bg-muted/50">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">
                  Use the + button above to simulate {mode === "add" ? "attending" : "bunking"}{" "}
                  future classes
                </p>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}
