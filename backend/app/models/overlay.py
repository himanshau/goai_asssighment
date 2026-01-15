from datetime import datetime
from bson import ObjectId


class OverlayModel:
    """Overlay model for MongoDB operations."""
    
    def __init__(self, db):
        self.collection = db.overlays
    
    def create_overlay(self, user_id: str, overlay_data: dict) -> dict:
        """Create a new overlay."""
        overlay_doc = {
            'user_id': user_id,
            'type': overlay_data.get('type', 'text'),  # 'text' or 'image'
            'content': overlay_data.get('content', ''),
            'position': {
                'x': overlay_data.get('position', {}).get('x', 100),
                'y': overlay_data.get('position', {}).get('y', 100)
            },
            'size': {
                'width': overlay_data.get('size', {}).get('width', 200),
                'height': overlay_data.get('size', {}).get('height', 50)
            },
            'style': {
                'fontSize': overlay_data.get('style', {}).get('fontSize', 16),
                'fontColor': overlay_data.get('style', {}).get('fontColor', '#ffffff'),
                'backgroundColor': overlay_data.get('style', {}).get('backgroundColor', 'transparent'),
                'opacity': overlay_data.get('style', {}).get('opacity', 1),
                'fontFamily': overlay_data.get('style', {}).get('fontFamily', 'Arial'),
                'fontWeight': overlay_data.get('style', {}).get('fontWeight', 'normal')
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = self.collection.insert_one(overlay_doc)
        overlay_doc['_id'] = result.inserted_id
        return self._serialize_overlay(overlay_doc)
    
    def get_overlays_by_user(self, user_id: str) -> list:
        """Get all overlays for a user."""
        overlays = self.collection.find({'user_id': user_id}).sort('created_at', -1)
        return [self._serialize_overlay(overlay) for overlay in overlays]
    
    def get_overlay_by_id(self, overlay_id: str, user_id: str) -> dict | None:
        """Get a single overlay by ID."""
        try:
            overlay = self.collection.find_one({
                '_id': ObjectId(overlay_id),
                'user_id': user_id
            })
            return self._serialize_overlay(overlay) if overlay else None
        except Exception:
            return None
    
    def update_overlay(self, overlay_id: str, user_id: str, update_data: dict) -> dict | None:
        """Update an overlay."""
        try:
            # Build update document
            update_doc = {'updated_at': datetime.utcnow()}
            
            # Update type if provided
            if 'type' in update_data:
                update_doc['type'] = update_data['type']
            
            # Update content if provided
            if 'content' in update_data:
                update_doc['content'] = update_data['content']
            
            # Update position if provided
            if 'position' in update_data:
                update_doc['position'] = {
                    'x': update_data['position'].get('x', 0),
                    'y': update_data['position'].get('y', 0)
                }
            
            # Update size if provided
            if 'size' in update_data:
                update_doc['size'] = {
                    'width': update_data['size'].get('width', 200),
                    'height': update_data['size'].get('height', 50)
                }
            
            # Update style if provided
            if 'style' in update_data:
                update_doc['style'] = update_data['style']
            
            result = self.collection.find_one_and_update(
                {'_id': ObjectId(overlay_id), 'user_id': user_id},
                {'$set': update_doc},
                return_document=True
            )
            
            return self._serialize_overlay(result) if result else None
        except Exception:
            return None
    
    def delete_overlay(self, overlay_id: str, user_id: str) -> bool:
        """Delete an overlay."""
        try:
            result = self.collection.delete_one({
                '_id': ObjectId(overlay_id),
                'user_id': user_id
            })
            return result.deleted_count > 0
        except Exception:
            return False
    
    def _serialize_overlay(self, overlay: dict) -> dict:
        """Serialize overlay document for JSON response."""
        if not overlay:
            return None
        return {
            'id': str(overlay['_id']),
            'user_id': overlay['user_id'],
            'type': overlay['type'],
            'content': overlay['content'],
            'position': overlay['position'],
            'size': overlay['size'],
            'style': overlay.get('style', {}),
            'created_at': overlay['created_at'].isoformat() if overlay.get('created_at') else None,
            'updated_at': overlay['updated_at'].isoformat() if overlay.get('updated_at') else None
        }
