import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { BarChart3, GraduationCap, AlertTriangle, TrendingUp, Calendar, Settings } from "lucide-react-native";
import { SubjectCard } from "../../components/SubjectCard";
import { StatCard } from "../../components/StatCard";
import { Button } from "../../components/ui/Button";
import { Progress } from "../../components/ui/Progress";
import { useAttendanceData } from "../../hooks/useAttendanceData";
import { calculateStatus, calculateBunks, calculateMustAttend } from "../../lib/calculations";

export default function Dashboard() {
  const router = useRouter();
  const { subjects } = useAttendanceData();

  // Calculate Aggregates
  const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
  const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
  const avgAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  const atRiskCount = subjects.filter(s => {
    const status = calculateStatus(s);
    return status === "high" || status === "critical";
  }).length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap size={24} color="white" />
            </View>
            <View>
              <Text className="text-xl font-bold text-gray-900">Attendance Guardian</Text>
              <Text className="text-sm text-gray-500">Spring Semester</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/attendance")}
              className="h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"
            >
              <Calendar size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/settings")}
              className="h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"
            >
              <Settings size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Stats Overview */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <StatCard
              title="Avg Attendance"
              value={`${avgAttendance}%`}
              subtitle="All subjects"
              icon={BarChart3}
              trend={avgAttendance >= 75 ? "up" : "down"}
              gradient
            />
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <StatCard
              title="At Risk"
              value={atRiskCount}
              subtitle="Below required"
              icon={AlertTriangle}
            />
          </View>
          <View className="flex-1">
            <StatCard
              title="Status"
              value={avgAttendance >= 80 ? "Safe" : avgAttendance >= 75 ? "Warning" : "Critical"}
              subtitle="Overall"
              icon={TrendingUp}
            />
          </View>
        </View>

        {/* Risk Meter */}
        <View className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">Risk Meter</Text>
            <Text className="text-sm text-gray-500">{avgAttendance}% Average</Text>
          </View>
          <View className="space-y-2">
            <Progress value={avgAttendance} className="h-3" />
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-400">0%</Text>
              <Text className="text-xs text-gray-400">75% (Req)</Text>
              <Text className="text-xs text-gray-400">100%</Text>
            </View>
          </View>
        </View>

        {/* Subjects Grid */}
        <View className="space-y-4">
          <Text className="text-2xl font-bold text-gray-900">Your Subjects</Text>
          <View className="gap-4">
            {subjects.map((subject) => {
              const status = calculateStatus(subject);
              const attendancePct = Math.round((subject.attendedClasses / subject.totalClasses) * 100);

              const cardProps = {
                name: subject.name,
                code: subject.code,
                teacher: subject.teacher,
                attendance: attendancePct,
                required: subject.requiredPercentage,
                status: status as "safe" | "warning" | "high" | "critical",
                surpriseLevel: "low" as const,
                canBunk: calculateBunks(subject),
                mustAttend: calculateMustAttend(subject)
              };

              return (
                <SubjectCard
                  key={subject.id}
                  subject={cardProps}
                  onPress={() => router.push(`/subject/${subject.id}`)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
