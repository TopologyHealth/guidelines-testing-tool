import requests
from fastapi import Depends, HTTPException, status
from typing import Any
import os
from dotenv import load_dotenv

load_dotenv()

SNOMED_BASE_URL = os.getenv('SNOMED_BASE_URL')
LOINC_BASE_URL = os.getenv('LOINC_BASE_URL')

def get_snomed_term_by_code(snomed_code: str, api_key: str) -> Any:
    try:
        snomed_url = f"{SNOMED_BASE_URL}/{snomed_code}"
        params = {
            "apikey": api_key,
            "include": "prefLabel",
        }
        response = requests.get(snomed_url, params=params)

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get SNOMED term from BioPortal API.",
            )

        return response.json()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

def get_loinc_term_by_code(loinc_code: str, api_key: str) -> Any:
    try:
        loinc_url = f"{LOINC_BASE_URL}/{loinc_code}"
        params = {
            "apikey": api_key,
            "include": "prefLabel",
        }
        response = requests.get(loinc_url, params=params)

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get LOINC term from BioPortal API.",
            )

        return response.json()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
