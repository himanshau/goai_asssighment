from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from app.config import Config

# Initialize MongoDB client
mongo_client = None
db = None
jwt = JWTManager()

def create_app():
    """Create and configure the Flask application."""
    global mongo_client, db
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize JWT
    jwt.init_app(app)
    
    # Initialize MongoDB connection
    mongo_client = MongoClient(app.config['MONGO_URI'])
    db = mongo_client[app.config['MONGO_DB_NAME']]
    
    # Create indexes
    db.users.create_index('email', unique=True)
    db.overlays.create_index('user_id')
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.overlays import overlays_bp
    from app.routes.settings import settings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(overlays_bp, url_prefix='/api/overlays')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'RTSP Overlay API is running'}
    
    return app


def get_db():
    """Get the database instance."""
    return db
