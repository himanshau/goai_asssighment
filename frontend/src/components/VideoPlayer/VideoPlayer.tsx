import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { useVolumeControl } from '../../hooks/useVolumeControl';
import { useScreenRecording } from '../../hooks/useScreenRecording';
import VideoOverlays from './VideoOverlays';
import RecordingIndicator from './RecordingIndicator';
import VideoControls from './VideoControls';

interface VideoPlayerProps {
    streamUrl: string;
    onError?: (error: string) => void;
}

/**
 * Video player component with HLS streaming, volume control, and screen recording
 */
export default function VideoPlayer({ streamUrl, onError }: VideoPlayerProps) {
    // Initialize hooks
    const { videoRef, isLoading, error } = useVideoPlayer({ streamUrl, onError });
    const { volume, isMuted, toggleMute, handleVolumeChange } = useVolumeControl({ videoRef });
    const { isRecording, recordingTime, maxRecordingTime, startRecording, stopRecording } = useScreenRecording();

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                autoPlay
                muted
            />

            {/* Loading & Error Overlays */}
            <VideoOverlays isLoading={isLoading} error={error} />

            {/* Recording Indicator */}
            {isRecording && (
                <RecordingIndicator
                    recordingTime={recordingTime}
                    maxRecordingTime={maxRecordingTime}
                />
            )}

            {/* Controls Bar */}
            <VideoControls
                volume={volume}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
                isRecording={isRecording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
            />
        </div>
    );
}
