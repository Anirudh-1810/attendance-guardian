import React from 'react';
import {
    TextInput,
    Text,
    View,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface InputFieldProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    containerStyle,
    style,
    ...props
}: InputFieldProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor={Colors.light.muted}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: Colors.light.danger,
    },
    error: {
        fontSize: 12,
        color: Colors.light.danger,
        marginTop: 4,
    },
});
