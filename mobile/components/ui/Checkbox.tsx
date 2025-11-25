import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "../../lib/utils";

interface CheckboxProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
    return (
        <TouchableOpacity
            onPress={() => onCheckedChange?.(!checked)}
            className={cn(
                "h-5 w-5 items-center justify-center rounded border border-gray-900 bg-white",
                checked && "bg-gray-900",
                className
            )}
        >
            {checked && <Check size={14} color="white" />}
        </TouchableOpacity>
    );
}
