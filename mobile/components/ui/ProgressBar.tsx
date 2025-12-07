import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ProgressBarProps {
    progress: number; // 0-100
    color?: string;
    height?: number;
    style?: ViewStyle;
}

export function ProgressBar({
    progress,
    color = Colors.light.primary,
    height = 8,
    style,
}: ProgressBarProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <View style={[styles.container, { height }, style]}>
            <View
                style={[
                    styles.fill,
                    {
                        width: `${clampedProgress}%`,
                        backgroundColor: color,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Colors.light.border,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
});
