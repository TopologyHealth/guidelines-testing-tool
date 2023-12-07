from ..settings import get_settings
from ..schemas.auth.cognito_users import *
import requests, json
from fastapi import HTTPException
from starlette.status import HTTP_403_FORBIDDEN
from ..JWTBearer import JWKS
from enum import Enum

settings = get_settings()