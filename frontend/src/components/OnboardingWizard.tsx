import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Check, Plus, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingWizardProps {
    onComplete: () => void;
}

const DAYS = [
    { id: 1, label: "Monday" },
    { id: 2, label: "Tuesday" },
    { id: 3, label: "Wednesday" },
    { id: 4, label: "Thursday" },
    { id: 5, label: "Friday" },
    { id: 6, label: "Saturday" },
    { id: 0, label: "Sunday" },
];

const SLOTS = [1, 2, 3, 4, 5, 6, 7];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data State
    const [formData, setFormData] = useState({
        semesterName: "Semester 1",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), "yyyy-MM-dd"),
        workingDays: [1, 2, 3, 4, 5],
        subjects: [] as { name: string; requiredPercentage: number; initialAttended: number; initialTotal: number }[],
        timetable: [] as { day: number; slot: number; subjectIndex: number }[],
    });

    const updateFormData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error("Failed to save data");

            onComplete();
        } catch (error) {
            console.error(error);
            // Show error handling here (toast)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="p-8 backdrop-blur-md bg-card/80 border-primary/20 shadow-2xl">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Setup Your Semester
                        </h2>
                        <span className="text-sm font-medium text-muted-foreground">Step {step} of 4</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <Step1
                            data={formData}
                            update={updateFormData}
                            onNext={handleNext}
                        />
                    )}
                    {step === 2 && (
                        <Step2
                            data={formData}
                            update={updateFormData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {step === 3 && (
                        <Step3
                            data={formData}
                            update={updateFormData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {step === 4 && (
                        <Step4
                            data={formData}
                            update={updateFormData}
                            onSubmit={handleSubmit}
                            onBack={handleBack}
                            isLoading={loading}
                        />
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}

// --- Steps Components ---

function Step1({ data, update, onNext }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Basic Details</h3>

                <div className="space-y-2">
                    <Label>Semester Name</Label>
                    <Input
                        value={data.semesterName}
                        onChange={(e) => update("semesterName", e.target.value)}
                        placeholder="e.g. Semester 5"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={data.startDate}
                            onChange={(e) => update("startDate", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            value={data.endDate}
                            onChange={(e) => update("endDate", e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Working Days</Label>
                    <div className="flex flex-wrap gap-3">
                        {DAYS.map((day) => (
                            <div
                                key={day.id}
                                onClick={() => {
                                    const current = data.workingDays;
                                    const knew = current.includes(day.id)
                                        ? current.filter((d: number) => d !== day.id)
                                        : [...current, day.id];
                                    update("workingDays", knew);
                                }}
                                className={`cursor-pointer px-4 py-2 rounded-full border transition-all ${data.workingDays.includes(day.id)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-muted"
                                    }`}
                            >
                                {day.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onNext} className="gap-2">
                    Next Step <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}

function Step2({ data, update, onNext, onBack }: any) {
    const [newSubject, setNewSubject] = useState("");
    const [target, setTarget] = useState("75");

    const addSubject = () => {
        if (!newSubject.trim()) return;
        update("subjects", [
            ...data.subjects,
            {
                name: newSubject,
                requiredPercentage: parseInt(target) || 75,
                initialAttended: 0,
                initialTotal: 0
            }
        ]);
        setNewSubject("");
        setTarget("75");
    };

    const removeSubject = (index: number) => {
        const newSubjects = [...data.subjects];
        newSubjects.splice(index, 1);
        update("subjects", newSubjects);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Add Subjects</h3>

                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Label>Subject Name</Label>
                        <Input
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="e.g. Mathematics"
                            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                        />
                    </div>
                    <div className="w-24 space-y-2">
                        <Label>Target %</Label>
                        <Input
                            type="number"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        />
                    </div>
                    <Button onClick={addSubject} size="icon" className="mb-0.5">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2">
                    {data.subjects.map((sub: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div>
                                <p className="font-semibold">{sub.name}</p>
                                <p className="text-xs text-muted-foreground">Target: {sub.requiredPercentage}%</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeSubject(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {data.subjects.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No subjects added yet. Add at least one to proceed.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={onNext} disabled={data.subjects.length === 0} className="gap-2">
                    Next Step <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}

function Step3({ data, update, onNext, onBack }: any) {
    const isWorkingDescription = (dayId: number) => data.workingDays.includes(dayId);

    const getSlotValue = (dayId: number, slot: number) => {
        const entry = data.timetable.find((e: any) => e.day === dayId && e.slot === slot);
        return entry ? entry.subjectIndex.toString() : "";
    };

    const handleSlotChange = (dayId: number, slot: number, subjectIdx: string) => {
        let newTable = [...data.timetable];
        // Remove existing if any
        newTable = newTable.filter((e: any) => !(e.day === dayId && e.slot === slot));

        if (subjectIdx !== "" && subjectIdx !== "free") {
            newTable.push({
                day: dayId,
                slot: slot,
                subjectIndex: parseInt(subjectIdx)
            });
        }
        update("timetable", newTable);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Weekly Timetable</h3>
                    <p className="text-sm text-muted-foreground">Assign subjects to slots</p>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="p-3 text-left w-20">Day</th>
                                {SLOTS.map(slot => (
                                    <th key={slot} className="p-3 text-center min-w-[120px]">
                                        Slot {slot}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map(day => {
                                if (!isWorkingDescription(day.id)) return null;
                                return (
                                    <tr key={day.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="p-3 font-medium">{day.label}</td>
                                        {SLOTS.map(slot => (
                                            <td key={slot} className="p-2">
                                                <Select
                                                    value={getSlotValue(day.id, slot)}
                                                    onValueChange={(val) => handleSlotChange(day.id, slot, val)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs w-full">
                                                        <SelectValue placeholder="-" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="free">- Free -</SelectItem>
                                                        {data.subjects.map((sub: any, idx: number) => (
                                                            <SelectItem key={idx} value={idx.toString()}>
                                                                {sub.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={onNext} className="gap-2">
                    Next Step <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}

function Step4({ data, update, onSubmit, onBack, isLoading }: any) {
    const updateStats = (index: number, field: string, value: string) => {
        const newSubjects = [...data.subjects];
        const numVal = parseInt(value) || 0;

        // Ensure attended <= total
        if (field === 'initialAttended') {
            if (numVal > newSubjects[index].initialTotal) {
                newSubjects[index].initialTotal = numVal;
            }
        }

        newSubjects[index] = { ...newSubjects[index], [field]: numVal };
        update("subjects", newSubjects);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Initial Attendance (Optional)</h3>
                <p className="text-muted-foreground text-sm">
                    If you have already attended some classes, enter the data below to start with accurate stats.
                </p>

                <div className="space-y-4 mt-4">
                    {data.subjects.map((sub: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-card">
                            <div className="flex-1">
                                <h4 className="font-bold">{sub.name}</h4>
                                <p className="text-xs text-muted-foreground">Target: {sub.requiredPercentage}%</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="space-y-1">
                                    <Label className="text-xs">Attended</Label>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={sub.initialAttended || ""}
                                        onChange={(e) => updateStats(idx, 'initialAttended', e.target.value)}
                                    />
                                </div>
                                <div className="pt-5 text-muted-foreground">/</div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Total</Label>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={sub.initialTotal || ""}
                                        onChange={(e) => updateStats(idx, 'initialTotal', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg button-glow"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">Saving...</span>
                    ) : (
                        <span className="flex items-center gap-2">Complete Setup <Check className="h-4 w-4" /></span>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
