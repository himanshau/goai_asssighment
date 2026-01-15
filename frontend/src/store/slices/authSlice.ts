import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI, User } from '../../services/api';
import config from '../../config/config';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
};

// Async thunks
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem(config.TOKEN_KEY);
        if (!token) {
            return null;
        }
        try {
            const response = await authAPI.getMe();
            return response.data.user;
        } catch (error) {
            localStorage.removeItem(config.TOKEN_KEY);
            localStorage.removeItem(config.REFRESH_TOKEN_KEY);
            localStorage.removeItem(config.USER_KEY);
            return rejectWithValue('Session expired');
        }
    }
);

export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await authAPI.signin({ email, password });
            const { user, access_token, refresh_token } = response.data;

            localStorage.setItem(config.TOKEN_KEY, access_token);
            localStorage.setItem(config.REFRESH_TOKEN_KEY, refresh_token);
            localStorage.setItem(config.USER_KEY, JSON.stringify(user));

            return user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to sign in');
        }
    }
);

export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({ email, password, username }: { email: string; password: string; username: string }, { rejectWithValue }) => {
        try {
            const response = await authAPI.signup({ email, password, username });
            const { user, access_token, refresh_token } = response.data;

            localStorage.setItem(config.TOKEN_KEY, access_token);
            localStorage.setItem(config.REFRESH_TOKEN_KEY, refresh_token);
            localStorage.setItem(config.USER_KEY, JSON.stringify(user));

            return user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to sign up');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem(config.TOKEN_KEY);
            localStorage.removeItem(config.REFRESH_TOKEN_KEY);
            localStorage.removeItem(config.USER_KEY);
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User | null>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            // Sign In
            .addCase(signIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signIn.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Sign Up
            .addCase(signUp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUp.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
