from fastapi import  HTTPException, Request, Response, Cookie, Path
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from urllib.parse import urlencode
from requests import get, post, Session
import requests 
from typing import Optional, Tuple
import json
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

# ENV
ENV = os.getenv('ENV')

# CLIENT CREDENTIALS
CLIENT_ID = os.getenv('MEDPLUM_CLIENT_ID')
CLIENT_SECRET = os.getenv('MEDPLUM_CLIENT_SECRET')

# URLs
FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL')
MEDPLUM_REDIRECT_URI = os.getenv('MEDPLUM_REDIRECT_URI')
MEDPLUM_BASE_URL = os.getenv('MEDPLUM_BASE_URL')
MEDPLUM_TOKEN_URL= os.getenv('MEDPLUM_TOKEN_URL')
MEDPLUM_AUTHORIZATION_URL = os.getenv('MEDPLUM_AUTHORIZATION_URL')
MEDPLUM_SCOPE = os.getenv('MEDPLUM_SCOPE')

def medplum_api_request(url: str, access_token: str, refresh_token: str) -> Tuple[str, str, Response]:

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = get(url, headers=headers)

    if response.status_code == 401:
        # Refresh tokens
        access_token, refresh_token = refresh_access_token(refresh_token)

        # Update headers with the new access token
        headers["Authorization"] = f"Bearer {access_token}"

        # Retry the GET request with the new access token
        response = get(url, headers=headers)

        if response.status_code == 401:
            raise HTTPException(status_code=307, detail="/authorize")

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Medplum API request failed")

    return access_token, refresh_token, response, headers

def create_fastapi_response(content: dict, access_token: str, refresh_token: str) -> Response:
    fastapi_response = Response(content=json.dumps(content), media_type="application/json")

    # set cookies in the response
    fastapi_response.set_cookie(key="access_token", value=access_token, samesite='none')
    fastapi_response.set_cookie(key="refresh_token", value=refresh_token, samesite='none')

    return fastapi_response


def get_patients(
    request: Request, 
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
):

    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="Not Authorized")

    access_token, refresh_token, response, headers = medplum_api_request(f"{MEDPLUM_BASE_URL}/Patient", access_token, refresh_token)

    patients = response.json()

    return create_fastapi_response(patients, access_token, refresh_token)

       



def get_patient_everything(
    patient_id: str,
    request: Request,
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
):
    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="Not Authorized")

    access_token, refresh_token, response, headers = medplum_api_request(f"{MEDPLUM_BASE_URL}/Patient/{patient_id}/$everything", access_token, refresh_token)

    patinetBundle = response.json()

    return create_fastapi_response(patinetBundle, access_token, refresh_token)

def get_patient_resources(
    request: Request, 
    id: str,
    resource_type: str,
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
):
    # Get the access token and refresh token from the cookies first
    # If there is no access token or no refresh token raise an exception
    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="Not Authorized")

    if not id:
        raise HTTPException(status_code=401, detail="No Patient Id Provided")
    
    availableResourceTypes = ["Condition" , "Immunization", "Observation"]
    
    if resource_type not in availableResourceTypes:
        raise HTTPException(status_code=401, detail="Unavailable Resource Type Provided")

    access_token, refresh_token, response, headers = medplum_api_request(f"{MEDPLUM_BASE_URL}/{resource_type}?patient={id}", access_token, refresh_token)

    patientResources = response.json()

    return create_fastapi_response(patientResources, access_token, refresh_token)

def get_patient_conditions(
    request: Request, 
    id: str,
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
):
    # Get the access token and refresh token from the cookies first
    # If there is no access token or no refresh token raise an exception
    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="Not Authorized")

    if not id:
        raise HTTPException(status_code=401, detail="No Patient Id Provided")

    access_token, refresh_token, response, headers = medplum_api_request(f"{MEDPLUM_BASE_URL}/Condition?patient={id}", access_token, refresh_token)
    
    patientConditions = response.json()

    return create_fastapi_response(patientConditions, access_token, refresh_token)


def get_conditions(
    request: Request, 
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
):

    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="Not Authorized")

    access_token, refresh_token, response, headers = medplum_api_request(f"{MEDPLUM_BASE_URL}/Condition?_count=100000", access_token, refresh_token)

    obj = response.json()["entry"]
    codes = []

    for o in obj:
        if (o["resource"]["code"]["coding"] not in codes):
            codes.append(o["resource"]["code"]["coding"])

    response_content = {
        "_content": codes
    }

    return create_fastapi_response(response_content, access_token, refresh_token)


def get_patient_by_condition(
    request: Request, 
    code: str,
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
):
    # Get the access token and refresh token from the cookie first
    # If there is no cookie or no patient id, raise an exception
    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="Not Authorized")

    if not code:
        raise HTTPException(status_code=401, detail="No Patient Id Provided")

    access_token, refresh_token, response, headers = medplum_api_request(f"{MEDPLUM_BASE_URL}/Condition?code={code}&_count=100000", access_token, refresh_token)

    obj = response.json()["entry"]
    patients = []

    for o in obj:
        ref = o["resource"]["subject"]["reference"]
        response = get(f"{MEDPLUM_BASE_URL}/" + ref, headers=headers)
        if response.status_code == 200:
            if response.json() not in patients:
                patients.append({"resource" : response.json()})

    response_content = {
        "_content": patients
    }

    return create_fastapi_response(response_content, access_token, refresh_token)


def get_authorized(response: Response, next: str = "/"):
    params = urlencode({
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'redirect_uri': MEDPLUM_REDIRECT_URI,
        'scope': MEDPLUM_SCOPE,
        'state': next
    })
    response.headers["Location"] = f'{MEDPLUM_AUTHORIZATION_URL}?{params}'
    response.status_code = 307
    return response

def get_callback(code: str, response: Response = None, state: str = "/"):
    # Exchange the code for an access token
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': MEDPLUM_REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }

    r = requests.post(MEDPLUM_TOKEN_URL, data=token_data)


    if r.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed")

    # Extract the access token from the response
    token_response = r.json()

    access_token = token_response.get("access_token")
    refresh_token = token_response.get("refresh_token")

    if not access_token or not refresh_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Define secure flag based on the environment
    secure_cookie = True if ENV == "production" else False
    
    # Define same_site flag based on the environment
    same_site_cookie = "None" if ENV == "production" else "Lax"

    # Set the access token and refresh token in secure HTTP only cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=secure_cookie, samesite=same_site_cookie)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=secure_cookie, samesite=same_site_cookie)

    # redirect to the page stored in the state parameter
    response.headers["Location"] = f"{FRONTEND_BASE_URL}{state}"
    response.status_code = 307
    return response


def refresh_access_token(refresh_token: str) -> Tuple[str, str]:
     # Refresh the tokens
    refresh_token_payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }

    response = post(
        MEDPLUM_TOKEN_URL,
        data=refresh_token_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code != 200:
        raise HTTPException(status_code=307, detail="/authorize")

    new_access_token = response.json().get("access_token")
    new_refresh_token = response.json().get("refresh_token")

    return new_access_token, new_refresh_token





