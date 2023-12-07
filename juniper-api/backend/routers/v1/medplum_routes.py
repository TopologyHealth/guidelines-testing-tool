from ..base import *
from fastapi import APIRouter, Depends, Header, Request, Response
from typing import Optional
from ...deps.medplum_deps import get_patients, get_patient_everything, get_patient_resources, get_patient_conditions, get_conditions, get_patient_by_condition, get_authorized, get_callback

router = APIRouter()

@router.get("/patients", dependencies=[Depends(auth)])
async def get_patients_endpoint(
    request: Request,
    data=Depends(get_patients),
    Authorization: Optional[str] = Header(None)
):
    return data

@router.get("/patient/{patient_id}/everything", dependencies=[Depends(auth)])
async def get_patient_everything_endpoint(
    patient_id: str,
    request: Request,
    data=Depends(get_patient_everything),
    Authorization: Optional[str] = Header(None)
):
    return data

@router.get("/patient_resources", dependencies=[Depends(auth)])
async def get_patient_resources_endpoint(
    request: Request,
    id: str,
    resource_type: str,
    data=Depends(get_patient_resources),
    Authorization: Optional[str] = Header(None)
):
    return data

@router.get("/patient_conditions", dependencies=[Depends(auth)])
async def get_patient_conditions_endpoint(
    request: Request,
    id: str,
    data=Depends(get_patient_conditions),
    Authorization: Optional[str] = Header(None)
):
    return data

@router.get("/conditions", dependencies=[Depends(auth)])
async def get_conditions_endpoint(
    request: Request,
    data=Depends(get_conditions),
    Authorization: Optional[str] = Header(None)
):
    return data

@router.get("/patient_by_condition", dependencies=[Depends(auth)])
async def get_patient_by_condition_endpoint(
    request: Request,
    code: str,
    data=Depends(get_patient_by_condition),
    Authorization: Optional[str] = Header(None)
):
    return data

@router.get("/authorize")
def authorize(response: Response = Depends(get_authorized)):
    return response

@router.get("/callback")
def callback(response: Response = Depends(get_callback)):
    return response
