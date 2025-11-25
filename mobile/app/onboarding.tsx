import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Upload, Calendar, FileText, Check, ArrowRight } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Checkbox } from "../components/ui/Checkbox";
import { cn } from "../lib/utils";

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [timetableUploaded, setTimetableUploaded] = useState(false);

    const handleFileUpload = () => {
        // Simulate file upload
        setTimeout(() => {
            setTimetableUploaded(true);
            Alert.alert("Success", "Timetable extracted successfully!");
        }, 1500);
    };

    const handleComplete = async () => {
        try {
            await AsyncStorage.setItem("onboarded", "true");
            Alert.alert("Success", "Setup complete! Welcome to Attendance Risk Detector");
            router.replace("/(tabs)");
        } catch (error) {
            console.error("Failed to save onboarding status", error);
        }
    };

    const steps = [
        { number: 1, title: "Upload", icon: Upload },
        { number: 2, title: "Dates", icon: Calendar },
        { number: 3, title: "Rules", icon: FileText },
        { number: 4, title: "Review", icon: Check },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {/* Progress Steps */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between">
                        {steps.map((s, index) => {
                            const StepIcon = s.icon;
                            const isActive = s.number === step;
                            const isComplete = s.number < step;

                            return (
                                <View key={s.number} className="flex-1 flex-row items-center">
                                    <View className="flex-1 flex-col items-center">
                                        <View
                                            className={cn(
                                                "h-10 w-10 items-center justify-center rounded-full border-2",
                                                isComplete
                                                    ? "border-blue-600 bg-blue-600"
                                                    : isActive
                                                        ? "border-blue-600 bg-white"
                                                        : "border-gray-300 bg-gray-100"
                                            )}
                                        >
                                            {isComplete ? (
                                                <Check size={20} color="white" />
                                            ) : (
                                                <StepIcon
                                                    size={20}
                                                    color={isActive ? "#2563eb" : "#9ca3af"}
                                                />
                                            )}
                                        </View>
                                        <Text
                                            className={cn(
                                                "mt-1 text-xs font-medium",
                                                isActive ? "text-gray-900" : "text-gray-500"
                                            )}
                                        >
                                            {s.title}
                                        </Text>
                                    </View>
                                    {index < steps.length - 1 && (
                                        <View
                                            className={cn(
                                                "h-0.5 flex-1",
                                                s.number < step ? "bg-blue-600" : "bg-gray-200"
                                            )}
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Step Content */}
                <View>
                    {step === 1 && (
                        <Card className="p-4">
                            <View className="items-center space-y-2 mb-6">
                                <Text className="text-2xl font-bold text-center">Upload Timetable</Text>
                                <Text className="text-center text-gray-500">
                                    Upload an image of your timetable to extract subjects
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={handleFileUpload}
                                disabled={timetableUploaded}
                                className={cn(
                                    "mb-6 items-center justify-center rounded-2xl border-2 border-dashed p-8",
                                    timetableUploaded ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
                                )}
                            >
                                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Upload size={32} color="#2563eb" />
                                </View>
                                <Text className="mb-1 font-medium text-gray-900">
                                    {timetableUploaded ? "Timetable Uploaded" : "Tap to upload"}
                                </Text>
                                <Text className="text-sm text-gray-500">PNG, JPG or PDF</Text>
                            </TouchableOpacity>

                            {timetableUploaded && (
                                <View className="mb-6 space-y-3">
                                    <Text className="font-semibold text-gray-900">Detected Subjects</Text>
                                    {["Data Structures", "DBMS", "OS", "Networks"].map((subject) => (
                                        <View
                                            key={subject}
                                            className="flex-row items-center gap-3 rounded-lg bg-gray-100 p-3"
                                        >
                                            <Check size={16} color="#2563eb" />
                                            <Text className="font-medium text-gray-900">{subject}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <Button
                                className="w-full"
                                size="lg"
                                onPress={() => setStep(2)}
                                disabled={!timetableUploaded}
                                label="Continue"
                            />
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="p-4">
                            <View className="items-center space-y-2 mb-6">
                                <Text className="text-2xl font-bold text-center">Semester Dates</Text>
                                <Text className="text-center text-gray-500">
                                    Set your semester duration and holidays
                                </Text>
                            </View>

                            <View className="space-y-4 mb-6">
                                <View className="flex-row gap-4">
                                    <View className="flex-1 space-y-2">
                                        <Text className="font-medium text-gray-700">Start Date</Text>
                                        <Input placeholder="YYYY-MM-DD" />
                                    </View>
                                    <View className="flex-1 space-y-2">
                                        <Text className="font-medium text-gray-700">End Date</Text>
                                        <Input placeholder="YYYY-MM-DD" />
                                    </View>
                                </View>

                                <View className="space-y-3">
                                    <Text className="font-medium text-gray-700">Weekly Holidays</Text>
                                    <View className="flex-row flex-wrap gap-3">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                            <View key={day} className="flex-row items-center space-x-2">
                                                <Checkbox />
                                                <Text className="text-sm text-gray-700">{day}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <View className="space-y-2">
                                    <Text className="font-medium text-gray-700">Additional Holidays</Text>
                                    <Input placeholder="Add holiday dates" />
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onPress={() => setStep(1)}
                                    label="Back"
                                />
                                <Button
                                    className="flex-1"
                                    onPress={() => setStep(3)}
                                    label="Continue"
                                />
                            </View>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card className="p-4">
                            <View className="items-center space-y-2 mb-6">
                                <Text className="text-2xl font-bold text-center">Leave Rules</Text>
                                <Text className="text-center text-gray-500">
                                    Configure duty and medical leave settings
                                </Text>
                            </View>

                            <View className="space-y-6 mb-6">
                                <View className="space-y-4 rounded-lg border border-gray-200 p-4">
                                    <View className="flex-row items-center justify-between">
                                        <View>
                                            <Text className="font-semibold text-gray-900">Duty Leave</Text>
                                            <Text className="text-sm text-gray-500">Official activities</Text>
                                        </View>
                                        <Checkbox checked={true} />
                                    </View>
                                    <View className="space-y-2">
                                        <Text className="text-sm font-medium text-gray-700">Add Dates</Text>
                                        <Input placeholder="Select dates" />
                                    </View>
                                </View>

                                <View className="space-y-4 rounded-lg border border-gray-200 p-4">
                                    <View className="flex-row items-center justify-between">
                                        <View>
                                            <Text className="font-semibold text-gray-900">Medical Leave</Text>
                                            <Text className="text-sm text-gray-500">Health absences</Text>
                                        </View>
                                        <Checkbox checked={true} />
                                    </View>
                                    <View className="space-y-2">
                                        <Text className="text-sm font-medium text-gray-700">Add Dates</Text>
                                        <Input placeholder="Select dates" />
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onPress={() => setStep(2)}
                                    label="Back"
                                />
                                <Button
                                    className="flex-1"
                                    onPress={() => setStep(4)}
                                    label="Continue"
                                />
                            </View>
                        </Card>
                    )}

                    {step === 4 && (
                        <Card className="p-4">
                            <View className="items-center space-y-2 mb-6">
                                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Check size={32} color="#2563eb" />
                                </View>
                                <Text className="text-2xl font-bold text-center">All Set!</Text>
                                <Text className="text-center text-gray-500">
                                    Here's a summary of your configuration
                                </Text>
                            </View>

                            <View className="space-y-4 mb-6">
                                <View className="rounded-lg bg-gray-100 p-4">
                                    <Text className="font-semibold text-gray-900 mb-1">Subjects</Text>
                                    <Text className="text-sm text-gray-500">4 subjects detected</Text>
                                </View>

                                <View className="rounded-lg bg-gray-100 p-4">
                                    <Text className="font-semibold text-gray-900 mb-1">Duration</Text>
                                    <Text className="text-sm text-gray-500">16 weeks remaining</Text>
                                </View>

                                <View className="rounded-lg bg-gray-100 p-4">
                                    <Text className="font-semibold text-gray-900 mb-1">Leaves</Text>
                                    <Text className="text-sm text-gray-500">Duty and Medical enabled</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onPress={() => setStep(3)}
                                    label="Back"
                                />
                                <Button
                                    className="flex-1"
                                    onPress={handleComplete}
                                    label="Finish Setup"
                                />
                            </View>
                        </Card>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
