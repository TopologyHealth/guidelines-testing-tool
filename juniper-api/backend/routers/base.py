
from fastapi import APIRouter, Depends, Request, Response
from fastapi_cognito_security import CognitoBearer

from ..deps import *
from ..settings import get_settings

settings = get_settings()

auth = CognitoBearer(
    app_client_id=settings.CLIENT_ID,
    userpool_id=settings.USERPOOL_ID
    )
