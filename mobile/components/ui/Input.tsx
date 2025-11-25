import * as React from "react";
import { TextInput, View } from "react-native";
import { cn } from "../../lib/utils";

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, React.ComponentPropsWithoutRef<typeof TextInput>>(
    ({ className, placeholderTextColor, ...props }, ref) => {
        return (
            <TextInput
                ref={ref}
                className={cn(
                    "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500",
                    className
                )}
                placeholderTextColor={placeholderTextColor || "#6b7280"}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
