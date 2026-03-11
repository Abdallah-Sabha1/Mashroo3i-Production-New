import axios, { AxiosError } from 'axios';

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44395/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─────────── Types ───────────
export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    education?: string;
    experience?: string;
    businessInterest?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    userId: number;
    fullName: string;
    email: string;
    token: string;
}

export interface ApiError {
    error: string;
}

// ─────────── Auth API ───────────
export const authAPI = {
    /**
     * Register a new user
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/Auth/register', data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Registration failed');
            }
            throw new Error('Network error. Please try again.');
        }
    },

    /**
     * Login existing user
     */
    login: async (data: LoginData): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/Auth/login', data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.error || 'Login failed');
            }
            throw new Error('Network error. Please try again.');
        }
    },
};

export default api;