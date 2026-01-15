import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchOverlays, createOverlay, updateOverlay, deleteOverlay, selectOverlay, setEditingOverlay, updateOverlayLocal } from '../store/slices/overlaysSlice';
import { fetchStreamSettings, updateStreamSettings } from '../store/slices/settingsSlice';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import OverlayComponent from '../components/Overlay';
import OverlayPanel from '../components/OverlayPanel';
import { Button, Input, Modal } from '../components/ui';
import { CreateOverlayData } from '../services/api';

// Memoized video container to prevent re-renders
const VideoContainer = memo(function VideoContainer({
    streamUrl
}: {
    streamUrl: string;
}) {
    return <VideoPlayer streamUrl={streamUrl} />;
});

// Memoized overlay layer
const OverlayLayer = memo(function OverlayLayer({
    containerBounds
}: {
    containerBounds: DOMRect | null;
}) {
    const dispatch = useAppDispatch();
    const { items: overlays, selectedId } = useAppSelector((state) => state.overlays);

    const handleUpdate = useCallback((id: string, updates: { position?: { x: number; y: number }; size?: { width: number; height: number } }) => {
        // Optimistic local update first
        dispatch(updateOverlayLocal({ id, updates }));
        // Then sync to backend
        dispatch(updateOverlay({ id, data: updates }));
    }, [dispatch]);

    const handleEdit = useCallback((overlay: typeof overlays[0]) => {
        dispatch(setEditingOverlay(overlay));
    }, [dispatch]);

    const handleDelete = useCallback((id: string) => {
        dispatch(deleteOverlay(id));
    }, [dispatch]);

    const handleSelect = useCallback((id: string) => {
        dispatch(selectOverlay(id));
    }, [dispatch]);

    const handleContainerClick = useCallback(() => {
        dispatch(selectOverlay(null));
    }, [dispatch]);

    return (
        <div className="absolute inset-0 pointer-events-none" onClick={handleContainerClick}>
            <div className="relative w-full h-full pointer-events-auto">
                {overlays.map(overlay => (
                    <OverlayComponent
                        key={overlay.id}
                        overlay={overlay}
                        containerBounds={containerBounds}
                        onUpdate={handleUpdate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isSelected={selectedId === overlay.id}
                        onSelect={handleSelect}
                    />
                ))}
            </div>
        </div>
    );
});

// Settings Modal component
const SettingsModal = memo(function SettingsModal({
    isOpen,
    onClose
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const { streamUrl, loading } = useAppSelector((state) => state.settings);
    const [tempUrl, setTempUrl] = useState(streamUrl);

    useEffect(() => {
        setTempUrl(streamUrl);
    }, [streamUrl, isOpen]);

    const handleSave = useCallback(async () => {
        if (!tempUrl.trim()) return;
        await dispatch(updateStreamSettings({ stream_url: tempUrl.trim() }));
        onClose();
    }, [dispatch, tempUrl, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Stream Settings"
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} loading={loading}>Save Changes</Button>
                </>
            }
        >
            <div className="space-y-6">
                <div>
                    <Input
                        label="Stream URL (HLS/MP4)"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="Enter your stream URL..."
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        }
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Provide an HLS (.m3u8) or MP4 stream URL.
                    </p>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Sample Test Streams</h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => setTempUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')}
                            className="w-full text-left text-xs text-indigo-400 hover:text-indigo-300 truncate"
                        >
                            • Mux Test Stream (HLS)
                        </button>
                        <button
                            onClick={() => setTempUrl('https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8')}
                            className="w-full text-left text-xs text-indigo-400 hover:text-indigo-300 truncate"
                        >
                            • Akamai Test Stream (HLS)
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
});

export default function Landing() {
    const dispatch = useAppDispatch();
    const { streamUrl } = useAppSelector((state) => state.settings);
    const { loading: overlaysLoading } = useAppSelector((state) => state.overlays);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [containerBounds, setContainerBounds] = useState<DOMRect | null>(null);

    // Fetch initial data
    useEffect(() => {
        dispatch(fetchOverlays());
        dispatch(fetchStreamSettings());
    }, [dispatch]);

    // Update container bounds on resize
    useEffect(() => {
        const updateBounds = () => {
            if (videoContainerRef.current) {
                setContainerBounds(videoContainerRef.current.getBoundingClientRect());
            }
        };

        updateBounds();
        window.addEventListener('resize', updateBounds);
        return () => window.removeEventListener('resize', updateBounds);
    }, []);

    const handleSettingsClick = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    const handleCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);

    const handleAddOverlay = useCallback(async (data: CreateOverlayData) => {
        await dispatch(createOverlay(data));
    }, [dispatch]);

    const handleUpdateOverlay = useCallback(async (id: string, data: Partial<CreateOverlayData>) => {
        await dispatch(updateOverlay({ id, data }));
    }, [dispatch]);

    const handleDeleteOverlay = useCallback(async (id: string) => {
        await dispatch(deleteOverlay(id));
    }, [dispatch]);

    if (overlaysLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar onSettingsClick={handleSettingsClick} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Video Player with Overlays */}
                    <div className="lg:col-span-3">
                        <div
                            ref={videoContainerRef}
                            className="relative bg-slate-800 rounded-2xl overflow-hidden"
                        >
                            <VideoContainer streamUrl={streamUrl} />
                            <OverlayLayer containerBounds={containerBounds} />
                        </div>

                        {/* Stream Info */}
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400">Current Stream</h3>
                                    <p className="text-white text-sm mt-1 font-mono truncate max-w-lg">
                                        {streamUrl}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSettingsClick}
                                >
                                    Change Stream
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Overlay Panel */}
                    <div className="lg:col-span-1">
                        <OverlayPanel
                            onAdd={handleAddOverlay}
                            onEdit={handleUpdateOverlay}
                            onDelete={handleDeleteOverlay}
                        />
                    </div>
                </div>
            </main>

            <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />
        </div>
    );
}
