import { apiClient } from './client';

export interface SignupData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

/**
 * Sign up a new user
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
        return response;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Signup failed');
        }
        throw new Error('Signup failed');
    }
};

/**
 * Log in an existing user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
        return response;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Login failed');
        }
        throw new Error('Login failed');
    }
};
