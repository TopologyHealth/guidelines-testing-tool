from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi import HTTPException, Response, status
from typing import Any, Dict
from fastapi.encoders import jsonable_encoder
from fhir.resources.bundle import (
    Bundle, 
    BundleEntry, 
    BundleEntryRequest, 
    BundleEntryResponse, 
    BundleEntrySearch
)
from ..utils import logger
from ..lib import S3Resource
import io
import json
from datetime import datetime


s3 = S3Resource(bucket_name='juniper-guidelines')

def guideline_create(file_name: str, bundle: Bundle):
    try:
        if not file_name:
            raise Exception("No file_name provided")

        if not bundle:
            raise Exception("No file provided")

            
        if s3.key_exists(file_name):
            raise Exception("File already exists")

        metadata = s3.create_metadata(file_name)

        bts = s3.to_bytes(bundle)
        resp = s3.upload_object(file_name, bts, metadata)
        return JSONResponse(content=f'Success: {str(resp)}')

    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )
    

def guideline_read(file_name: str | None = None):
    try:
        if not file_name:
            raise Exception("No file_name provided")

        if not s3.key_exists(file_name):
            raise Exception("File NOT found")
            
        bts = s3.download_object(file_name)
        resp = Bundle.parse_raw(bts, encoding='utf-8-sig')
        return resp
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )

def guideline_read_metadata(file_name: str):
    try:
        if not file_name:
            raise Exception("No file_name provided")

        if not s3.key_exists(file_name):
            raise Exception("File NOT found")
            
        
        metadata = s3.get_metadata(file_name)
        return metadata
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )

def guideline_update(file_name: str, bundle: Bundle ):
    try:
        if not file_name:
            raise Exception("No file_name provided")

        if not bundle:
            raise Exception("No file provided")

        if not s3.key_exists(file_name):
            raise Exception("File NOT found")

        # Retrieve the existing metadata
        metadata = s3.get_metadata(file_name)

        #increment count and version
        count = int(metadata['count'])
        count = count + 1
        version = f"v{count}"

        # Update metadata's count, version, and date
        metadata['count'] = str(count)
        metadata['version'] = version
        metadata['date'] = datetime.now().isoformat()     

        bts = s3.to_bytes(bundle)
        resp = s3.upload_object(file_name, bts, metadata)
        return JSONResponse(
            content=f'Success: {str(resp)}'
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )

def guideline_update_status(file_name: str, status: str ):
    try:
        if not file_name:
            raise Exception("No file_name provided")

        if not status:
            raise Exception("No status provided")

        if status != "draft" and status != "active" and status != "retired":
            raise Exception("Wrong status provided")

        if not s3.key_exists(file_name):
            raise Exception("File NOT found")


        #Downloading object from S3        
        bts = s3.download_object(file_name)
        resp = Bundle.parse_raw(bts, encoding='utf-8-sig')

        #Converting to dict and changing status
        resp_dict = resp.dict()
        resp_dict["entry"][0]["resource"]["status"] = status

        #Converting back to Bundle object and preparing for upload
        bundle = Bundle(**resp_dict)

       # Retrieve the existing metadata
        metadata = s3.get_metadata(file_name)

        #increment count and version
        count = int(metadata['count'])
        count = count + 1
        version = f"v{count}"

        # Update metadata's count, version, and date
        metadata['count'] = str(count)
        metadata['version'] = version
        metadata['date'] = datetime.now().isoformat()   

        bts = s3.to_bytes(bundle)

        #Uploading to S3
        resp = s3.upload_object(file_name, bts, metadata)

        return JSONResponse(
            content=f'Success: {str(resp)}'
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )

def guideline_update_metadata(file_name: str, status: str):
    try:
        if not file_name:
            raise Exception("No file_name provided")

        if not status:
            raise Exception("No status provided")
            
        if not s3.key_exists(file_name):
            raise Exception("File NOT found")

        # Retrieve the existing guideline
        bts = s3.download_object(file_name)
        existing_guideline = Bundle.parse_raw(bts, encoding='utf-8-sig')
        
        # Convert guideline to bytes for upload
        bts = s3.to_bytes(existing_guideline)

        # Retrieve the existing metadata
        metadata = s3.get_metadata(file_name)

        # Update the status and date
        metadata['status'] = status
        metadata['date'] = datetime.now().isoformat()  


        # Delete the existing guideline
        s3.delete_one_object(file_name)

        # Upload the new guideline and new_metadata
        resp = s3.upload_object(file_name, bts, metadata)

        return JSONResponse(content=f'Success: {str(resp)}')
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )

def guidelines_list():
    try:
        guidelines = s3.get_all_objects()
        return guidelines
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )

def versions_list(file_name: str):
    try:
        versions = s3.get_all_versions(file_name)
        return versions
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )
    
def guideline_delete(file_name: str):
    try:
        if not file_name:
            raise Exception("No file name provided")

        if not s3.key_exists(file_name):
            raise Exception("File NOT found")
                
        resp = s3.delete_one_object(file_name)
        return JSONResponse(
            content=f'Success: {str(resp)}'
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, 
            detail=str(e)
        )
       








