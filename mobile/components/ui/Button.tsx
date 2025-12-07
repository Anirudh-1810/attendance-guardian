import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyles = [
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        disabled && styles.button_disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
        disabled && styles.text_disabled,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    button_primary: {
        backgroundColor: Colors.light.primary,
    },
    button_secondary: {
        backgroundColor: Colors.light.secondary,
    },
    button_outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    button_danger: {
        backgroundColor: Colors.light.danger,
    },
    button_small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    button_medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    button_large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    button_disabled: {
        opacity: 0.5,
    },
    text: {
        fontWeight: '600',
    },
    text_primary: {
        color: '#fff',
    },
    text_secondary: {
        color: '#fff',
    },
    text_outline: {
        color: Colors.light.text,
    },
    text_danger: {
        color: '#fff',
    },
    text_small: {
        fontSize: 14,
    },
    text_medium: {
        fontSize: 16,
    },
    text_large: {
        fontSize: 18,
    },
    text_disabled: {
        opacity: 0.7,
    },
});
