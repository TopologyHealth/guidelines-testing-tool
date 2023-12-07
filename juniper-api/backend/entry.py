from fastapi import FastAPI, Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND, 
    HTTP_422_UNPROCESSABLE_ENTITY, 
    HTTP_200_OK
)
from .settings import get_settings
from .utils.exception_handler import *
from .routers.v1 import guideline_routes, bioportal_routes, medplum_routes, auth_routes

settings = get_settings()

ORIGINS = settings.CORS_ORIGINS
CREDENTIALS = settings.CORS_ALLOW_CREDENTIALS
METHODS = settings.CORS_ALLOW_METHODS
HEADERS = settings.CORS_ALLOW_HEADERS
AUTH_TAG = settings.AUTH_TAGS
TITLE = settings.TITLE
OPENAPI_URL = settings.OPENAPI_URL
DOCS_URL = settings.DOCS_URL
REDOC_URL = settings.REDOC_URL

def application() -> FastAPI:
    app = FastAPI(
        title=TITLE,
        openapi_url=OPENAPI_URL,
        docs_url=DOCS_URL, 
        redoc_url=REDOC_URL)

    app.add_middleware(CORSMiddleware, 
                    allow_origins=ORIGINS,
                    allow_credentials=True, 
                    allow_methods=METHODS, 
                    allow_headers=HEADERS)


    @app.exception_handler(EnumException)
    async def enum_exception_handler(
        request: Request, 
        exc: EnumException
        ) -> JSONResponse:
        '''Custom http error response'''
        return JSONResponse(
            status_code=HTTP_400_BAD_REQUEST,
            content={"error": f"{exc.error_message}"})
                            
    @app.exception_handler(UserNotFoundException)
    async def auth_handler(
        request: Request, 
        exc: UserNotFoundException
        ) -> JSONResponse:
        return JSONResponse(
            status_code=HTTP_400_BAD_REQUEST,
            content={"error": f"{exc.error_message}"})


    # @app.exception_handler(RequestValidationError)
    # async def validation_exception_handler(
    #     request: Request, 
    #     exc: RequestValidationError
    #     ) -> JSONResponse:
    #     '''Custom error response for enumerated serialization'''
    #     error_source = exc.errors()[0]['loc'][1]    
    #     error_msg = jsonable_encoder(
    #         {"error": f"{error_source} parameter is invalid"})
    #     return JSONResponse(
    #         status_code=HTTP_400_BAD_REQUEST, 
    #         content=error_msg[0])

    # app.include_router(marchi_routes.router, 
    #                 tags=['marc-hi'], 
    #                 prefix='/marchi')


    app.include_router(guideline_routes.router, tags=['Guidelines'])
    app.include_router(bioportal_routes.router, tags=['BioPortal'], prefix='/bioportal')
    app.include_router(medplum_routes.router, tags=['Medplum'], prefix='/medplum')
    app.include_router(auth_routes.router, tags=['Auth'], prefix='/auth')


    @app.on_event("startup")
    async def on_startup():
        print('Application Startup Actions....')

    @app.on_event("shutdown")
    async def on_shutdown():
        print('Application Shutdown Actions....')

    return app

# application factory init object
app = application()