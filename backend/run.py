"""Entry point for the Flask application."""
from app import create_app

app = create_app()

if __name__ == '__main__':
    print('🚀 Starting RTSP Overlay API Server...')
    print('📡 Server running at http://localhost:5000')
    print('📚 API Documentation:')
    print('   - POST /api/auth/signup - Register new user')
    print('   - POST /api/auth/signin - Login user')
    print('   - GET  /api/auth/me - Get current user')
    print('   - GET  /api/overlays - Get all overlays')
    print('   - POST /api/overlays - Create overlay')
    print('   - PUT  /api/overlays/<id> - Update overlay')
    print('   - DELETE /api/overlays/<id> - Delete overlay')
    print('   - GET  /api/settings/stream - Get stream settings')
    print('   - PUT  /api/settings/stream - Update stream settings')
    print('─' * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
