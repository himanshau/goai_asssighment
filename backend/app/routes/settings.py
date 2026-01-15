from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import get_db
from app.config import Config

settings_bp = Blueprint('settings', __name__)


@settings_bp.route('/stream', methods=['GET'])
@jwt_required()
def get_stream_settings():
    """Get current stream settings for the user."""
    try:
        user_id = get_jwt_identity()
        
        db = get_db()
        settings = db.settings.find_one({'user_id': user_id})
        
        if settings:
            return jsonify({
                'stream_url': settings.get('stream_url', Config.DEFAULT_STREAM_URL),
                'stream_type': settings.get('stream_type', 'hls')
            }), 200
        else:
            # Return default settings
            return jsonify({
                'stream_url': Config.DEFAULT_STREAM_URL,
                'stream_type': 'hls'
            }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@settings_bp.route('/stream', methods=['PUT'])
@jwt_required()
def update_stream_settings():
    """Update stream settings for the user."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        stream_url = data.get('stream_url', '').strip()
        stream_type = data.get('stream_type', 'hls')
        
        if not stream_url:
            return jsonify({'error': 'Stream URL is required'}), 400
        
        if stream_type not in ['hls', 'dash', 'mp4']:
            return jsonify({'error': 'Invalid stream type. Must be "hls", "dash", or "mp4"'}), 400
        
        db = get_db()
        
        # Upsert settings
        db.settings.update_one(
            {'user_id': user_id},
            {'$set': {
                'user_id': user_id,
                'stream_url': stream_url,
                'stream_type': stream_type
            }},
            upsert=True
        )
        
        return jsonify({
            'message': 'Stream settings updated successfully',
            'stream_url': stream_url,
            'stream_type': stream_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
