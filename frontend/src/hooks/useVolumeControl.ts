import { useState, useCallback, RefObject } from 'react';

interface UseVolumeControlOptions {
    videoRef: RefObject<HTMLVideoElement | null>;
    initialVolume?: number;
    initialMuted?: boolean;
}

interface UseVolumeControlReturn {
    volume: number;
    isMuted: boolean;
    toggleMute: () => void;
    handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook for video volume and mute control
 */
export function useVolumeControl({
    videoRef,
    initialVolume = 1,
    initialMuted = true,
}: UseVolumeControlOptions): UseVolumeControlReturn {
    const [volume, setVolume] = useState(initialVolume);
    const [isMuted, setIsMuted] = useState(initialMuted);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const newMutedState = !isMuted;
        video.muted = newMutedState;
        setIsMuted(newMutedState);
    }, [videoRef, isMuted]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);

        // Auto-unmute when volume is increased from zero
        if (newVolume > 0 && isMuted) {
            video.muted = false;
            setIsMuted(false);
        }
    }, [videoRef, isMuted]);

    return { volume, isMuted, toggleMute, handleVolumeChange };
}
