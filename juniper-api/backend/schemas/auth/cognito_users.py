from pydantic import BaseModel
from ...settings import get_settings
from enum import Enum

settings = get_settings()


# def get_expiration_date(duration_seconds: int = 86400) -> datetime:
    # return timezone.now() + timedelta(seconds=duration_seconds)

class GrantTypes(str, Enum):
    # https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
    AUTHORIZATION_CODE = 'authorization_code'
    REFRESH_TOKEN = 'refresh_token'
    CLIENT_CREDENTIALS = 'client_Credentials'


class Token(BaseModel):
    grant_type: GrantTypes
    client_id: str
    client_secret: str
    code: str
    redirect_uri: str        

    @classmethod
    def from_testing_default(
        cls, 
        code: str,
        # client_id: str = None, 
        # client_secret: str = None
        ):
        data = {
            'grant_type' : 'authorization_code',
            'client_id': settings.CLIENT_ID,
            'client_secret': settings.CLIENT_SECRET,
            'code': code,
            'redirect_uri' : 'https://develop-cognito.juniper-dep.com/'
        }
        return cls(**data)

class JWT(BaseModel):
    id_token: str
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str