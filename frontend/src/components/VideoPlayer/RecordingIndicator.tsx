import { formatTime } from '../../utils/formatTime';

interface RecordingIndicatorProps {
    recordingTime: number;
    maxRecordingTime: number;
}

/**
 * Recording badge showing REC status and elapsed time
 */
export default function RecordingIndicator({
    recordingTime,
    maxRecordingTime
}: RecordingIndicatorProps) {
    return (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg animate-pulse">
            <span className="w-3 h-3 bg-white rounded-full" />
            <span className="font-medium">
                REC {formatTime(recordingTime)} / {formatTime(maxRecordingTime)}
            </span>
        </div>
    );
}
