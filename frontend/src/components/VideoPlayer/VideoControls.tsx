import { Button } from '../ui';

interface VideoControlsProps {
    // Volume controls
    volume: number;
    isMuted: boolean;
    onToggleMute: () => void;
    onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // Recording controls
    isRecording: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
}

/**
 * Bottom control bar with volume, live indicator, and record button
 */
export default function VideoControls({
    volume,
    isMuted,
    onToggleMute,
    onVolumeChange,
    isRecording,
    onStartRecording,
    onStopRecording,
}: VideoControlsProps) {
    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
                {/* Left: Volume Control */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleMute}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted || volume === 0 ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={onVolumeChange}
                        className="w-24 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                        aria-label="Volume"
                    />
                </div>

                {/* Center: LIVE Indicator */}
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-white">LIVE</span>
                </div>

                {/* Right: Record Button */}
                <div>
                    {isRecording ? (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={onStopRecording}
                            icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                            }
                        >
                            Stop & Download
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onStartRecording}
                            icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="8" />
                                </svg>
                            }
                        >
                            Record Screen
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
