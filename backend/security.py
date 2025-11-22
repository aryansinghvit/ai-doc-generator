from datetime import datetime, timedelta
from jose import jwt
from typing import Optional
import bcrypt  # <--- Using this directly now

# 1. CONFIGURATION
SECRET_KEY = "super_secret_key_for_assignment_only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 2. PASSWORD TOOLS (Direct Bcrypt)
def get_password_hash(password):
    """Turns a plain password into a secret hash using bcrypt."""
    # Convert string to bytes
    pwd_bytes = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    # Return as string so it can be stored in the database
    return hashed_password.decode('utf-8')

def verify_password(plain_password, hashed_password):
    """Checks if the password entered matches the saved hash."""
    # Convert both to bytes
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    # Check if they match
    return bcrypt.checkpw(password_byte_enc, hashed_password_bytes)

# 3. TOKEN TOOLS (The ID Card Generator)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt