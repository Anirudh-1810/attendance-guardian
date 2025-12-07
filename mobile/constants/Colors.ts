/**
 * Theme Colors for the app (matching web app design)
 */

const tintColorLight = '#3b82f6'; // blue
const tintColorDark = '#8b5cf6';  // purple

export const Colors = {
    light: {
        text: '#11181C',
        background: '#fff',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        card: '#f9fafb',
        border: '#e5e7eb',
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        muted: '#6b7280',
    },
    dark: {
        text: '#ECEDEE',
        background: '#151718',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
        card: '#1f2937',
        border: '#374151',
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        muted: '#9ca3af',
    },
};

// Status Colors (same for both themes)
export const StatusColors = {
    safe: '#10b981',      // green
    warning: '#f59e0b',   // yellow/orange
    high: '#f97316',      // orange
    critical: '#ef4444',  // red
};
