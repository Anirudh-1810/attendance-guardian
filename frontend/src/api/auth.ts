const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export interface SignupData {
    name: string;
    email: string;
    password: string;
    inviteCode?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface GoogleLoginData {
    credential: string;
    inviteCode?: string;
}

export interface AuthResponse {
    message?: string;
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role?: string;
        avatar?: string;
    };
}

export interface ApiError {
    message: string;
    hint?: string;
    error?: string;
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
    }

    return result;
}

/**
 * Log in an existing user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Login failed');
    }

    return result;
}

/**
 * Log in or sign up with Google OAuth.
 * For new users, an inviteCode is required.
 */
export async function googleLogin(data: GoogleLoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Google login failed');
    }

    return result;
}

/**
 * Request an OTP for passwordless login
 */
export async function requestOtp(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to request OTP');
    }

    return result;
}

/**
 * Verify an OTP
 */
export async function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
    }

    return result;
}
