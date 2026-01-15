import axios from 'axios';
import config from '../config/config';

// Create axios instance
const api = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (requestConfig) => {
        const token = localStorage.getItem(config.TOKEN_KEY);
        if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear and redirect
            localStorage.removeItem(config.TOKEN_KEY);
            localStorage.removeItem(config.REFRESH_TOKEN_KEY);
            localStorage.removeItem(config.USER_KEY);
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

// Types
export interface User {
    id: string;
    email: string;
    username: string;
    created_at: string;
}

export interface OverlayPosition {
    x: number;
    y: number;
}

export interface OverlaySize {
    width: number;
    height: number;
}

export interface OverlayStyle {
    fontSize?: number;
    fontColor?: string;
    backgroundColor?: string;
    opacity?: number;
    fontFamily?: string;
    fontWeight?: string;
}

export interface Overlay {
    id: string;
    user_id: string;
    type: 'text' | 'image';
    content: string;
    position: OverlayPosition;
    size: OverlaySize;
    style: OverlayStyle;
    created_at: string;
    updated_at: string;
}

export interface CreateOverlayData {
    type: 'text' | 'image';
    content: string;
    position?: OverlayPosition;
    size?: OverlaySize;
    style?: OverlayStyle;
}

export interface UpdateOverlayData {
    type?: 'text' | 'image';
    content?: string;
    position?: OverlayPosition;
    size?: OverlaySize;
    style?: OverlayStyle;
}

// Auth API
export const authAPI = {
    signup: (data: { email: string; password: string; username: string }) =>
        api.post('/auth/signup', data),
    signin: (data: { email: string; password: string }) =>
        api.post('/auth/signin', data),
    getMe: () => api.get('/auth/me'),
    refresh: () => api.post('/auth/refresh')
};

// Overlays API
export const overlaysAPI = {
    getAll: () => api.get<{ overlays: Overlay[]; count: number }>('/overlays'),
    getOne: (id: string) => api.get<{ overlay: Overlay }>(`/overlays/${id}`),
    create: (data: CreateOverlayData) => api.post<{ overlay: Overlay; message: string }>('/overlays', data),
    update: (id: string, data: UpdateOverlayData) => api.put<{ overlay: Overlay; message: string }>(`/overlays/${id}`, data),
    delete: (id: string) => api.delete<{ message: string }>(`/overlays/${id}`)
};

// Settings API
export const settingsAPI = {
    getStream: () => api.get<{ stream_url: string; stream_type: string }>('/settings/stream'),
    updateStream: (data: { stream_url: string; stream_type?: string }) =>
        api.put<{ stream_url: string; stream_type: string; message: string }>('/settings/stream', data)
};

export default api;
