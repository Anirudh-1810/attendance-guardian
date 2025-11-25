import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof View> {
    value?: number;
}

const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
    ({ className, value, ...props }, ref) => (
        <View
            ref={ref}
            className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-100", className)}
            {...props}
        >
            <View
                className="h-full w-full flex-1 bg-blue-600 transition-all"
                style={{ width: `${value || 0}%` }}
            />
        </View>
    )
);
Progress.displayName = "Progress";

export { Progress };
