from ..base import *
from fastapi import APIRouter, Depends, Header, Request, Response
from typing import Optional
from ...deps.auth_deps import authenticate, try_auth

router = APIRouter()


@router.get("/authenticate")
async def authenticate_endpoint(
    request: Request,
    access_code: str,
    data = Depends(authenticate),
    ):
    return data

@router.get("/try_auth", dependencies=[Depends(auth)])
async def protected_endpoint(
    request: Request,
    data = Depends(try_auth),
    ):
    return data
