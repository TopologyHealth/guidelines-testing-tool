import functools
from pydantic import BaseSettings, AnyUrl, BaseModel
from os import environ
from typing import List


class _BaseSettings(BaseSettings):

    TITLE: str = 'Juniper API'
    # email services
    MAIL_PORT = 465
    MAIL_SERVER = 'in-v3.mailjet.com'
    MAIL_TLS = False
    MAIL_SSL = True    
    MAIL_SENDER = 'atom@comrom.ca'
    MAIL_QUE_SUBJECT = "Hey There!"
    MAIL_DEFAULT_SENDER = 'name@gmail.ca'
    MAIL_FROM_NAME = "Hello"
    # OpenApi docs route url.
    OPENAPI_URL: str = '/docs_openapi'
    DOCS_URL: str = '/docs'
    REDOC_URL: str = '/redoc_url'
    # Route Tags
    AUTH_V1_PREFIX = "/"
    AUTH_TAGS: List[str] = ["Authentication"]

    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ['*']
    CORS_ALLOW_HEADERS: List[str] = ['*']
    CORS_ORIGINS: List[AnyUrl] = [
        'http://0.0.0.0:8080',
        "http://localhost",
        "http://localhost:8080",
        "http://localhost:8080/#/",
        "http://localhost:3000"
        ]

    ALGORITHM: str = "HS256"
   

class Settings(_BaseSettings):
    # basedir = os.path.abspath(os.path.dirname('static'))
    # BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    # STATIC = os.path.join(os.path.dirname(BASE_DIR), 'backend/templates')
    # TESS_DATA = os.path.join(os.path.dirname(BASE_DIR), 'tess-data')

    # PROD_CLIENT_ID: str = '505e1d5e-cbe7-44fa-b080-fce6e9ce8930'
    # NON_PROD_CLIENT_ID: str = 'ece9d0d8-ce38-4430-8b69-c00c0d065f3f'

    PORT: int = environ.get('PORT', 8080)
    
    # testing secret
    # SECRET = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    # SECRET: str = str(environ.get('SECRET', ''))

    # testing mailjet email creds
    # MAIL_USERNAME: str = environ.get('MAIL_USERNAME')
    # MAIL_PASSWORD: str = environ.get('MAIL_PASSWORD')

    URL_NAME: AnyUrl = str(environ.get('URL_NAME', 'http://localhost:8080'))
    DATABASE_URL: str = str(environ.get('DATABASE_URL'))
    
    CLIENT_ID: str = '1tpp8tmvdgmr70f09m5bi4emnh'
    USERPOOL_ID: str ="us-east-2_pdDBFzbNE"
    CLIENT_SECRET: str = 'N/A'


@functools.lru_cache()
def get_settings(**kwargs) -> BaseSettings:
    return Settings(**kwargs)