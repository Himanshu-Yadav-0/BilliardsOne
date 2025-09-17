import enum
from pydantic import BaseModel,Field
from typing import Optional
# --- Input Schemas ---
class OwnerCreate(BaseModel):
    ownerName: str
    mobileNo: str = Field(..., pattern=r"^[6-9]\d{9}$", description="Must be a valid 10-digit Indian mobile number")
    pin: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", description="Must be a 6-digit numeric PIN")

# This class is a Pydantic model to represent the data
# that FastAPI's OAuth2PasswordRequestForm expects.
# We define it here so our controller has a clear type hint.
class OAuth2PasswordRequestForm(BaseModel):
    username: str
    password: str
    scope: str = ""
    grant_type: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str


class UserLogin(BaseModel):
    mobileNo: str
    pin: str
