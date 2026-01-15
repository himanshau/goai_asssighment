// Frontend configuration
const config = {
    // API Base URL
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

    // Default Stream URL (HLS format for browser playback)
    DEFAULT_STREAM_URL: import.meta.env.VITE_DEFAULT_STREAM_URL || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',

    // JWT Token Key for localStorage
    TOKEN_KEY: 'rtsp_overlay_token',
    REFRESH_TOKEN_KEY: 'rtsp_overlay_refresh_token',
    USER_KEY: 'rtsp_overlay_user',

    // Overlay defaults
    OVERLAY_DEFAULTS: {
        text: {
            width: 200,
            height: 50,
            fontSize: 18,
            fontColor: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            fontFamily: 'Inter',
            fontWeight: 'normal'
        },
        image: {
            width: 150,
            height: 100,
            opacity: 1
        }
    }
} as const;

export default config;
