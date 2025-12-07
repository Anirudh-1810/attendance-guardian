import React from 'react';
import { Text, View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface BadgeProps {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Badge({
    text,
    variant = 'default',
    style,
    textStyle,
}: BadgeProps) {
    return (
        <View style={[styles.badge, styles[`badge_${variant}`], style]}>
            <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badge_default: {
        backgroundColor: Colors.light.border,
    },
    badge_success: {
        backgroundColor: `${Colors.light.success}20`,
    },
    badge_warning: {
        backgroundColor: `${Colors.light.warning}20`,
    },
    badge_danger: {
        backgroundColor: `${Colors.light.danger}20`,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
    text_default: {
        color: Colors.light.text,
    },
    text_success: {
        color: Colors.light.success,
    },
    text_warning: {
        color: Colors.light.warning,
    },
    text_danger: {
        color: Colors.light.danger,
    },
});
