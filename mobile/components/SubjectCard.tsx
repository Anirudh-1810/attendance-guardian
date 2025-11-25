import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BookOpen, User, AlertCircle, CheckCircle } from "lucide-react-native";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Progress } from "./ui/Progress";

interface SubjectCardProps {
    subject: {
        name: string;
        code: string;
        teacher: string;
        attendance: number;
        required: number;
        status: "safe" | "warning" | "high" | "critical";
        surpriseLevel: "low" | "medium" | "high";
        canBunk: number;
        mustAttend: number;
    };
    onPress?: () => void;
}

const statusConfig = {
    safe: { variant: "safe" as const, label: "Safe", icon: CheckCircle },
    warning: { variant: "warning" as const, label: "Warning", icon: AlertCircle },
    high: { variant: "high" as const, label: "High Risk", icon: AlertCircle },
    critical: { variant: "critical" as const, label: "Critical", icon: AlertCircle },
};

const surpriseConfig = {
    low: { variant: "surprise-low" as const, label: "Low Surprise" },
    medium: { variant: "surprise-medium" as const, label: "Medium Surprise" },
    high: { variant: "surprise-high" as const, label: "High Surprise" },
};

export function SubjectCard({ subject, onPress }: SubjectCardProps) {
    const statusInfo = statusConfig[subject.status];
    const surpriseInfo = surpriseConfig[subject.surpriseLevel];
    const StatusIcon = statusInfo.icon;

    return (
        <TouchableOpacity onPress={onPress}>
            <Card className="p-4 border-2 border-transparent active:border-blue-100">
                <View className="space-y-4">
                    {/* Header */}
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 space-y-1">
                            <View className="flex-row items-center gap-2">
                                <BookOpen size={20} color="#2563eb" />
                                <Text className="font-semibold text-lg text-gray-900">{subject.name}</Text>
                            </View>
                            <Text className="text-sm text-gray-500">{subject.code}</Text>
                        </View>
                        <Badge variant={statusInfo.variant} className="flex-row items-center gap-1">
                            <StatusIcon size={12} color="currentColor" />
                            <Text className={
                                subject.status === 'safe' ? 'text-green-700' :
                                    subject.status === 'warning' ? 'text-yellow-700' :
                                        subject.status === 'high' ? 'text-orange-700' : 'text-red-700'
                            }>
                                {statusInfo.label}
                            </Text>
                        </Badge>
                    </View>

                    {/* Teacher */}
                    <View className="flex-row items-center gap-2">
                        <User size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-500">{subject.teacher}</Text>
                    </View>

                    {/* Attendance Percentage */}
                    <View className="space-y-2">
                        <View className="flex-row items-end justify-between">
                            <View>
                                <Text className="text-3xl font-bold text-gray-900">{subject.attendance}%</Text>
                                <Text className="text-sm text-gray-500">Current Attendance</Text>
                            </View>
                            <Badge variant="outline">
                                <Text className="text-xs text-gray-900">Required: {subject.required}%</Text>
                            </Badge>
                        </View>
                        <Progress value={subject.attendance} className="h-2" />
                    </View>

                    {/* Stats */}
                    <View className="flex-row gap-3 pt-2">
                        <View className="flex-1 space-y-1 rounded-lg bg-gray-50 p-3">
                            <Text className="text-xs text-gray-500">Can bunk next</Text>
                            <Text className="text-lg font-semibold text-gray-900">{subject.canBunk}</Text>
                        </View>
                        <View className="flex-1 space-y-1 rounded-lg bg-gray-50 p-3">
                            <Text className="text-xs text-gray-500">Must attend next</Text>
                            <Text className="text-lg font-semibold text-gray-900">{subject.mustAttend}</Text>
                        </View>
                    </View>

                    {/* Surprise Attendance Badge */}
                    <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                        <Text className="text-xs text-gray-500">Surprise Attendance</Text>
                        <Badge variant={surpriseInfo.variant}>
                            <Text className={
                                subject.surpriseLevel === 'low' ? 'text-blue-700' :
                                    subject.surpriseLevel === 'medium' ? 'text-purple-700' : 'text-pink-700'
                            }>
                                {surpriseInfo.label}
                            </Text>
                        </Badge>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}
