from datetime import datetime
from bson import ObjectId
import bcrypt


class UserModel:
    """User model for MongoDB operations."""
    
    def __init__(self, db):
        self.collection = db.users
    
    def create_user(self, email: str, password: str, username: str) -> dict:
        """Create a new user with hashed password."""
        # Hash the password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        user_doc = {
            'email': email.lower().strip(),
            'username': username.strip(),
            'password': hashed_password,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = self.collection.insert_one(user_doc)
        user_doc['_id'] = result.inserted_id
        return self._serialize_user(user_doc)
    
    def find_by_email(self, email: str) -> dict | None:
        """Find a user by email."""
        user = self.collection.find_one({'email': email.lower().strip()})
        return user
    
    def find_by_id(self, user_id: str) -> dict | None:
        """Find a user by ID."""
        try:
            user = self.collection.find_one({'_id': ObjectId(user_id)})
            return self._serialize_user(user) if user else None
        except Exception:
            return None
    
    def verify_password(self, user: dict, password: str) -> bool:
        """Verify user password."""
        if not user or 'password' not in user:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), user['password'])
    
    def _serialize_user(self, user: dict) -> dict:
        """Serialize user document for JSON response."""
        if not user:
            return None
        return {
            'id': str(user['_id']),
            'email': user['email'],
            'username': user['username'],
            'created_at': user['created_at'].isoformat() if user.get('created_at') else None
        }
