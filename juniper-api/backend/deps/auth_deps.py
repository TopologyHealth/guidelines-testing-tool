from fastapi_cognito_security import CognitoBearer
from fastapi import  HTTPException, Request, Response, Cookie, Path
from fastapi.responses import JSONResponse
import base64
from .base import *

# Set up instance of CognitoBearer with Juniper AWS User Pool
auth = CognitoBearer(
    app_client_id=settings.CLIENT_ID,
    userpool_id=settings.USERPOOL_ID
    )

# Helper method to request token from user pool with access code from hosted login
def get_token(code: str):
    data = Token.from_testing_default(code).dict()
    url = "https://sageprivateefcabce5-efcabce5-beta.auth.us-east-2.amazoncognito.com/oauth2/token"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post(url=url, headers=headers, data=data)
    return response

 # Helper method for getting well knowns from user pool
def get_wellknowns():
    jwks = JWKS.parse_obj(
    requests.get(
        f"https://cognito-idp.us-east-2.amazonaws.com/"
        f"us-east-2_pdDBFzbNE/.well-known/jwks.json"
    ).json()
    )
    return jwks

# Helper method for pulling id_token and refresh_token from full JWT
def get_jwt(code: str) -> str: 
    response = get_token(code)
    if "error" not in response.text:
        # Getting user info from b64 id_token
        try:
            id_token = json.loads(response.text)['id_token']
            start = id_token.index('.') + 1
            half = id_token[start:]
            end = half.index('.')
            b64_data = half[:end]  + "===" # Added extra padding to prevent binascii Error about incorrect padding with base64.b64decode
            b64_bytes = b64_data.encode('ascii')
            data_bytes = base64.b64decode(b64_bytes)
            data = json.loads(data_bytes.decode('ascii'))
            user_email = data["email"]
            user_given_name = data["given_name"]
        except:         # NOTE: Error handling here because a binascii Error about incorrect padding is sometimes caused by line 45 
            user_email = "email@email.com"
            user_given_name = "Name"

        return {
            'id_token': json.loads(response.text)['id_token'], 
            'refresh_token': json.loads(response.text)['refresh_token'],
            'user_email' : user_email,
            'user_given_name' : user_given_name
            }
    else:
        print(response.text)
        raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, detail="Bad code"
            )

# Method for endpoint to verify access token from hosted login
def authenticate(
    request: Request, 
    access_code: str,
):
    if not access_code:
        raise HTTPException(status_code=401, detail="Not Authorized")
    
    jwt = get_jwt(access_code)

    # Encoding JWT and user info into cookie of response
    # NOTE: Currently email and refresh token are included but are not presently used in the frontend,.
    #       I've included these in the case that they might be useful in the future.
    fast_api_response = JSONResponse({
        "id_token" : jwt["id_token"],
        'refresh_token' : jwt["refresh_token"],
        'user_email' : jwt['user_email'],
        'user_given_name' : jwt['user_given_name']
        })
    fast_api_response.set_cookie(key="id_token", value=jwt["id_token"])
    fast_api_response.set_cookie(key="refresh_token", value=jwt["refresh_token"])
    fast_api_response.set_cookie(key="user_email", value=jwt["user_email"])
    fast_api_response.set_cookie(key="user_given_name", value=jwt["user_given_name"])
    # fast_api_response.set_cookie(key="id_token", value=jwt["id_token"], secure='true', samesite='none')
    # fast_api_response.set_cookie(key="refresh_token", value=jwt["refresh_token"], secure='true',  samesite='none')
    # fast_api_response.set_cookie(key="user_email", value=jwt["user_email"], secure='true',  samesite='none')
    # fast_api_response.set_cookie(key="user_given_name", value=jwt["user_given_name"], secure='true',  samesite='none')

    return fast_api_response
    
# Method to verify user provided tokens are valid
def try_auth(
    request: Request,
):
    return JSONResponse(
            content=f'Success:'
        )
    