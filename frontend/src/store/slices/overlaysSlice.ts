import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { overlaysAPI, Overlay, CreateOverlayData, UpdateOverlayData } from '../../services/api';

interface OverlaysState {
    items: Overlay[];
    selectedId: string | null;
    editingOverlay: Overlay | null;
    loading: boolean;
    error: string | null;
}

const initialState: OverlaysState = {
    items: [],
    selectedId: null,
    editingOverlay: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchOverlays = createAsyncThunk(
    'overlays/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await overlaysAPI.getAll();
            return response.data.overlays;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch overlays');
        }
    }
);

export const createOverlay = createAsyncThunk(
    'overlays/create',
    async (data: CreateOverlayData, { rejectWithValue }) => {
        try {
            const response = await overlaysAPI.create(data);
            return response.data.overlay;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create overlay');
        }
    }
);

export const updateOverlay = createAsyncThunk(
    'overlays/update',
    async ({ id, data }: { id: string; data: UpdateOverlayData }, { rejectWithValue }) => {
        try {
            const response = await overlaysAPI.update(id, data);
            return response.data.overlay;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update overlay');
        }
    }
);

export const deleteOverlay = createAsyncThunk(
    'overlays/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await overlaysAPI.delete(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete overlay');
        }
    }
);

const overlaysSlice = createSlice({
    name: 'overlays',
    initialState,
    reducers: {
        selectOverlay: (state, action: PayloadAction<string | null>) => {
            state.selectedId = action.payload;
        },
        setEditingOverlay: (state, action: PayloadAction<Overlay | null>) => {
            state.editingOverlay = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Optimistic update for position/size (local update without API call)
        updateOverlayLocal: (state, action: PayloadAction<{ id: string; updates: Partial<Overlay> }>) => {
            const index = state.items.findIndex(o => o.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload.updates };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Overlays
            .addCase(fetchOverlays.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOverlays.fulfilled, (state, action: PayloadAction<Overlay[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchOverlays.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Overlay
            .addCase(createOverlay.fulfilled, (state, action: PayloadAction<Overlay>) => {
                state.items.unshift(action.payload);
            })
            // Update Overlay
            .addCase(updateOverlay.fulfilled, (state, action: PayloadAction<Overlay>) => {
                const index = state.items.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete Overlay
            .addCase(deleteOverlay.fulfilled, (state, action: PayloadAction<string>) => {
                state.items = state.items.filter(o => o.id !== action.payload);
                if (state.selectedId === action.payload) {
                    state.selectedId = null;
                }
            });
    },
});

export const { selectOverlay, setEditingOverlay, clearError, updateOverlayLocal } = overlaysSlice.actions;
export default overlaysSlice.reducer;
