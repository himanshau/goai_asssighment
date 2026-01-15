import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

interface UseVideoPlayerOptions {
    streamUrl: string;
    onError?: (error: string) => void;
}

interface UseVideoPlayerReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isLoading: boolean;
    error: string | null;
}

/**
 * Custom hook for HLS video streaming with fallback support
 */
export function useVideoPlayer({ streamUrl, onError }: UseVideoPlayerOptions): UseVideoPlayerReturn {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        setIsLoading(true);
        setError(null);

        // Check if HLS is supported via hls.js
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
                video.play().catch(console.error);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    const errorMsg = `Stream error: ${data.type}`;
                    setError(errorMsg);
                    onError?.(errorMsg);
                    setIsLoading(false);
                }
            });

            hlsRef.current = hls;

            return () => {
                hls.destroy();
                hlsRef.current = null;
            };
        }
        // Native HLS support (Safari)
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;

            const handleLoadedMetadata = () => {
                setIsLoading(false);
                video.play().catch(console.error);
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
        // Fallback for other video formats
        else {
            video.src = streamUrl;

            const handleLoadedData = () => {
                setIsLoading(false);
                video.play().catch(console.error);
            };

            const handleError = () => {
                setError('Failed to load video stream');
                setIsLoading(false);
            };

            video.addEventListener('loadeddata', handleLoadedData);
            video.addEventListener('error', handleError);

            return () => {
                video.removeEventListener('loadeddata', handleLoadedData);
                video.removeEventListener('error', handleError);
            };
        }
    }, [streamUrl, onError]);

    return { videoRef, isLoading, error };
}
