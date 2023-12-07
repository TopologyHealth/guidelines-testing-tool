from ..base import *
from fhir.resources.bundle import Bundle
from pydantic import BaseModel
from typing import *
from fastapi import HTTPException, Depends
from ...deps.guideline_deps import guideline_create, guideline_read, guideline_update, guideline_update_status, guideline_delete, guidelines_list, versions_list, guideline_read_metadata, guideline_update_metadata
import boto3


router = APIRouter()



@router.post("/create/guideline", dependencies=[Depends(auth)])
def create_guideline_endpoint(
    data = Depends(guideline_create)
    ):
    return data

@router.get("/read/guideline", dependencies=[Depends(auth)])
def read_guideline_endpoint(
    data = Depends(guideline_read)
    ):
    return data

@router.get("/read/metadata", dependencies=[Depends(auth)])
def read_metadata_endpoint(
    data = Depends(guideline_read_metadata)
    ):
    return data


@router.get("/list/guidelines", dependencies=[Depends(auth)])
def list_guidelines_endpoint(
    data = Depends(guidelines_list)
    ):
    return data

@router.get("/list/versions", dependencies=[Depends(auth)])
def list_versions_endpoint(
    data = Depends(versions_list)
    ):
    return data


@router.put("/update/guideline", dependencies=[Depends(auth)])
def update_guideline_endpoint(
    data = Depends(guideline_update)
    ):
    return data

@router.put("/update/guideline_status", dependencies=[Depends(auth)])
def update_guideline_status_endpoint(
    data = Depends(guideline_update_status)
    ):
    return data   

@router.put("/update/metadata", dependencies=[Depends(auth)])
def update_metadata_endpoint(
    data = Depends(guideline_update_metadata)
    ):
    return data

@router.delete("/delete/guideline", dependencies=[Depends(auth)])
def delete_guideline_endpoint(
    data = Depends(guideline_delete)
    ):
    return data


