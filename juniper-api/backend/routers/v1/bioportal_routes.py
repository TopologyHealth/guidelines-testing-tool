from ..base import *
from fastapi import APIRouter, Depends
from typing import Any
from ...deps.bioportal_deps import get_snomed_term_by_code, get_loinc_term_by_code
router = APIRouter()


@router.get("/snomed/terms/{snomed_code}", response_model=Any, dependencies=[Depends(auth)])
def get_snomed_term_by_code_endpoint(
    snomed_code: str,
    api_key: str,
    data=Depends(get_snomed_term_by_code)
):
    return data

@router.get("/loinc/terms/{loinc_code}", response_model=Any, dependencies=[Depends(auth)])
def get_loinc_term_by_code_endpoint(
    loinc_code: str,
    api_key: str,
    data=Depends(get_loinc_term_by_code)
):
    return data