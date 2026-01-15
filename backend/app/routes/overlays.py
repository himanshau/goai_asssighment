from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import get_db
from app.models.overlay import OverlayModel

overlays_bp = Blueprint('overlays', __name__)


@overlays_bp.route('', methods=['POST'])
@jwt_required()
def create_overlay():
    """Create a new overlay."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate overlay type
        overlay_type = data.get('type', 'text')
        if overlay_type not in ['text', 'image']:
            return jsonify({'error': 'Invalid overlay type. Must be "text" or "image"'}), 400
        
        # Validate content
        content = data.get('content', '')
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        db = get_db()
        overlay_model = OverlayModel(db)
        
        overlay = overlay_model.create_overlay(user_id, data)
        
        return jsonify({
            'message': 'Overlay created successfully',
            'overlay': overlay
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@overlays_bp.route('', methods=['GET'])
@jwt_required()
def get_overlays():
    """Get all overlays for the current user."""
    try:
        user_id = get_jwt_identity()
        
        db = get_db()
        overlay_model = OverlayModel(db)
        
        overlays = overlay_model.get_overlays_by_user(user_id)
        
        return jsonify({
            'overlays': overlays,
            'count': len(overlays)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@overlays_bp.route('/<overlay_id>', methods=['GET'])
@jwt_required()
def get_overlay(overlay_id):
    """Get a single overlay by ID."""
    try:
        user_id = get_jwt_identity()
        
        db = get_db()
        overlay_model = OverlayModel(db)
        
        overlay = overlay_model.get_overlay_by_id(overlay_id, user_id)
        
        if not overlay:
            return jsonify({'error': 'Overlay not found'}), 404
        
        return jsonify({'overlay': overlay}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@overlays_bp.route('/<overlay_id>', methods=['PUT'])
@jwt_required()
def update_overlay(overlay_id):
    """Update an overlay."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate overlay type if provided
        if 'type' in data and data['type'] not in ['text', 'image']:
            return jsonify({'error': 'Invalid overlay type. Must be "text" or "image"'}), 400
        
        db = get_db()
        overlay_model = OverlayModel(db)
        
        overlay = overlay_model.update_overlay(overlay_id, user_id, data)
        
        if not overlay:
            return jsonify({'error': 'Overlay not found'}), 404
        
        return jsonify({
            'message': 'Overlay updated successfully',
            'overlay': overlay
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@overlays_bp.route('/<overlay_id>', methods=['DELETE'])
@jwt_required()
def delete_overlay(overlay_id):
    """Delete an overlay."""
    try:
        user_id = get_jwt_identity()
        
        db = get_db()
        overlay_model = OverlayModel(db)
        
        deleted = overlay_model.delete_overlay(overlay_id, user_id)
        
        if not deleted:
            return jsonify({'error': 'Overlay not found'}), 404
        
        return jsonify({'message': 'Overlay deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
