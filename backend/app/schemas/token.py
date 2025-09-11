from pydantic import BaseModel
from typing import Optional
import enum

class Role(str, enum.Enum):
    owner = "owner"
    staff = "staff"

class TokenData(BaseModel):
    mobileNo: Optional[str] = None
    role: Optional[Role] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    role: Role
