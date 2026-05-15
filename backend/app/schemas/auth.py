from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list] = None
