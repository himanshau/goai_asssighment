import { useState, useRef, useCallback, useEffect } from 'react';

interface UseScreenRecordingOptions {
    maxDuration?: number; // Maximum recording duration in seconds
    filename?: string;    // Base filename for download
}

interface UseScreenRecordingReturn {
    isRecording: boolean;
    recordingTime: number;
    maxRecordingTime: number;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
}

/**
 * Custom hook for screen recording using MediaRecorder API
 * Automatically downloads recording as WebM when stopped
 */
export function useScreenRecording({
    maxDuration = 120,
    filename = 'overlay-recording',
}: UseScreenRecordingOptions = {}): UseScreenRecordingReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsRecording(false);
        setRecordingTime(0);
    }, []);

    // Stop recording function
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Start recording function
    const startRecording = useCallback(async () => {
        try {
            // Request screen capture permission
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'browser',
                },
                audio: true,
            });

            streamRef.current = stream;

            // Check for WebM support with VP9 codec
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            recordedChunksRef.current = [];

            // Collect data chunks
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop - create download
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename}-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                cleanup();
            };

            // Handle user stopping screen share
            stream.getVideoTracks()[0].onended = () => {
                stopRecording();
            };

            // Start recording with 1-second chunks
            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer with auto-stop at max duration
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= maxDuration - 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error('Recording error:', err);
            cleanup();
            alert('Failed to start recording. Please allow screen sharing.');
        }
    }, [maxDuration, filename, cleanup, stopRecording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, [cleanup]);

    return {
        isRecording,
        recordingTime,
        maxRecordingTime: maxDuration,
        startRecording,
        stopRecording,
    };
}
