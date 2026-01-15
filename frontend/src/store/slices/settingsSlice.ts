import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsAPI } from '../../services/api';
import config from '../../config/config';

interface SettingsState {
    streamUrl: string;
    streamType: string;
    loading: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    streamUrl: config.DEFAULT_STREAM_URL,
    streamType: 'hls',
    loading: false,
    error: null,
};

// Async thunks
export const fetchStreamSettings = createAsyncThunk(
    'settings/fetchStream',
    async (_, { rejectWithValue }) => {
        try {
            const response = await settingsAPI.getStream();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch settings');
        }
    }
);

export const updateStreamSettings = createAsyncThunk(
    'settings/updateStream',
    async (data: { stream_url: string; stream_type?: string }, { rejectWithValue }) => {
        try {
            const response = await settingsAPI.updateStream(data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update settings');
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Stream Settings
            .addCase(fetchStreamSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStreamSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.streamUrl = action.payload.stream_url || config.DEFAULT_STREAM_URL;
                state.streamType = action.payload.stream_type || 'hls';
            })
            .addCase(fetchStreamSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Stream Settings
            .addCase(updateStreamSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStreamSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.streamUrl = action.payload.stream_url;
                state.streamType = action.payload.stream_type;
            })
            .addCase(updateStreamSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
