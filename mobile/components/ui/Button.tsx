import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "flex-row items-center justify-center rounded-xl",
    {
        variants: {
            variant: {
                default: "bg-blue-600",
                destructive: "bg-red-600",
                outline: "border-2 border-gray-200 bg-white",
                secondary: "bg-gray-100",
                ghost: "bg-transparent",
                link: "bg-transparent",
            },
            size: {
                default: "h-11 px-6",
                sm: "h-9 px-4 rounded-lg",
                lg: "h-14 px-10 rounded-2xl",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const buttonTextVariants = cva(
    "font-semibold text-base",
    {
        variants: {
            variant: {
                default: "text-white",
                destructive: "text-white",
                outline: "text-gray-900",
                secondary: "text-gray-900",
                ghost: "text-gray-900",
                link: "text-blue-600 underline",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface ButtonProps
    extends React.ComponentPropsWithoutRef<typeof TouchableOpacity>,
    VariantProps<typeof buttonVariants> {
    label?: string;
    children?: React.ReactNode;
}

const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
    ({ className, variant, size, label, children, ...props }, ref) => {
        return (
            <TouchableOpacity
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {label ? (
                    <Text className={cn(buttonTextVariants({ variant }))}>{label}</Text>
                ) : (
                    children
                )}
            </TouchableOpacity>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
