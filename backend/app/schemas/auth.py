import enum
from pydantic import BaseModel

# --- Input Schemas ---
class OwnerCreate(BaseModel):
    ownerName: str
    mobileNo: str
    pin: str
from pydantic import BaseModel
from typing import Optional

class OwnerCreate(BaseModel):
    ownerName: str
    mobileNo: str
    pin: str

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
