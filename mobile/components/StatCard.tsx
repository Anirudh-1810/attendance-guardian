import React from "react";
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Card } from "./ui/Card";
import { cn } from "../lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    gradient?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, gradient }: StatCardProps) {
    return (
        <Card className={cn("p-4", gradient && "bg-blue-600 border-blue-600")}>
            <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                    <Text className={cn("text-sm font-medium", gradient ? "text-blue-100" : "text-gray-500")}>
                        {title}
                    </Text>
                    <Icon size={20} color={gradient ? "#dbeafe" : "#2563eb"} />
                </View>
                <View className="space-y-1">
                    <Text className={cn("text-3xl font-bold", gradient ? "text-white" : "text-gray-900")}>
                        {value}
                    </Text>
                    {subtitle && (
                        <Text className={cn("text-xs", gradient ? "text-blue-200" : "text-gray-500")}>
                            {subtitle}
                        </Text>
                    )}
                </View>
                {trend && (
                    <View className="flex-row items-center gap-1">
                        {trend === "up" && <Text className="text-xs text-green-600">↑ Improving</Text>}
                        {trend === "down" && <Text className="text-xs text-red-600">↓ Declining</Text>}
                        {trend === "neutral" && (
                            <Text className={cn("text-xs", gradient ? "text-blue-300" : "text-gray-500")}>
                                → Stable
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </Card>
    );
}
