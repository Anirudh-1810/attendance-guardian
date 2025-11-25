import * as React from "react";
import { Text, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-blue-600 text-white shadow hover:bg-blue-600/80",
                secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80",
                destructive: "border-transparent bg-red-600 text-white shadow hover:bg-red-600/80",
                outline: "text-gray-900 border-gray-200",
                safe: "border-transparent bg-green-100 text-green-700",
                warning: "border-transparent bg-yellow-100 text-yellow-700",
                high: "border-transparent bg-orange-100 text-orange-700",
                critical: "border-transparent bg-red-100 text-red-700",
                "surprise-low": "border-transparent bg-blue-50 text-blue-700",
                "surprise-medium": "border-transparent bg-purple-50 text-purple-700",
                "surprise-high": "border-transparent bg-pink-50 text-pink-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.ComponentPropsWithoutRef<typeof View>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <View className={cn(badgeVariants({ variant }), className)} {...props}>
            {props.children}
        </View>
    );
}

export { Badge, badgeVariants };
