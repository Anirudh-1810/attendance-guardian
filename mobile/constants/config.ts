// API Configuration
export const API_CONFIG = {
    // Update this to your backend URL
    // For development: 'http://localhost:4000' or 'http://10.0.2.2:4000' for Android emulator
    // For production: your deployed backend URL
    BASE_URL: __DEV__ ? 'http://localhost:4000' : 'https://your-production-api.com',
    TIMEOUT: 10000,
};

// App Constants
export const APP_CONFIG = {
    DEFAULT_REQUIRED_PERCENTAGE: 75,
    MAX_SUBJECTS: 20,
    STORAGE_KEYS: {
        AUTH_TOKEN: '@attendance_guardian:auth_token',
        USER_DATA: '@attendance_guardian:user_data',
    },
};

// Status Colors
export const STATUS_COLORS = {
    safe: '#10b981',      // green
    warning: '#f59e0b',   // yellow/orange
    high: '#f97316',      // orange
    critical: '#ef4444',  // red
};

// Theme Colors (matching web app)
export const THEME_COLORS = {
    primary: '#3b82f6',     // blue
    secondary: '#8b5cf6',   // purple
    success: '#10b981',     // green
    danger: '#ef4444',      // red
    warning: '#f59e0b',     // orange
    info: '#06b6d4',        // cyan
};
