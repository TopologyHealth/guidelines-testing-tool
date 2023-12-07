from typing import Generator
from botocore.errorfactory import ClientError
from botocore import UNSIGNED
import boto3
import json
from typing import List, Dict, Union, Tuple, Set, Any
from ..utils import logger
from fhir.resources.bundle import Bundle
import botocore
from botocore.exceptions import ClientError
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

AWS_PROFILE_NAME = os.getenv('AWS_PROFILE_NAME')

class S3Resource:

    def __init__(
        self, 
        bucket_name = None
        ) -> None:

        if not bucket_name:
            raise ValueError('Please specify S3 bucket')

        self._bucket_name = bucket_name
        boto3.setup_default_session(profile_name=AWS_PROFILE_NAME)
        self.s3 = boto3.resource('s3')
        self.s3_client = boto3.client('s3')


    def __repr__(self):
        return self._bucket_name


    @property
    def bucket_name(self) -> str:
        return self._bucket_name


   
    def to_bytes(self, response: Bundle) -> bytes:
        response_json = response.json()
        response_bytes = bytes(response_json, "utf-8-sig")
        return response_bytes


    def upload_object(
        self, 
        to_s3_path: str, 
        file_bytes: bytes,
        metadata: dict
        ) -> str:
        try:
            bucket = self.s3.Bucket(self._bucket_name)
            obj = bucket.put_object(
                Key=to_s3_path, 
                Body=file_bytes,
                Metadata=metadata)
            return obj
        except Exception as e:
            logger.warn(f'{e}')
            raise Exception(e)


    def download_object(
        self,
        key: str
        ) -> bytes:
        try:
            obj = self.s3.Object(
                bucket_name=self.bucket_name, 
                key= key
            )
            resp = obj.get()['Body'].read()
            return resp
        except Exception as e:
            logger.warn(f'{e}')
            raise Exception(e)



    def get_all_objects(self) -> list:
        try:
            objects = []
            bucket = self.s3.Bucket(self._bucket_name)
            for obj in bucket.objects.all():
                s3_object = self.s3.Object(self._bucket_name, obj.key)
                metadata = s3_object.metadata
                bts = s3_object.get()['Body'].read()
                json = Bundle.parse_raw(bts, encoding='utf-8-sig')
                objects.append({"metadata": metadata, "json": json})
            return objects
        except Exception as e:
            logger.warn(f'{e}')
            raise Exception(e)


    def get_all_versions(self, key: str) -> list:
        try:
            version_objects = []
            
            versions = self.s3_client.list_object_versions(Bucket=self._bucket_name, Prefix=key)['Versions']
            for version in versions: 
                version_id = version['VersionId']
                response = self.s3_client.get_object(Bucket=self._bucket_name, Key=key, VersionId=version_id)
                metadata = response['Metadata']
                date_modified = response['LastModified']
                bts = response['Body'].read()
                json = Bundle.parse_raw(bts, encoding='utf-8-sig')
                version_objects.append({"version_id": version_id, "metadata": metadata, "date_modified": date_modified, "json": json})
            
            return version_objects

            
        except Exception as e:
            logger.warn(f'{e}')
            raise Exception(e)

    


    


    def delete_one_object(
        self, 
        key: str
        ) -> bool:
        try:
            response = self.s3.Object(self._bucket_name, key).delete()
            return True
        except Exception as e:
            logger.warn(f'{e}')
            raise Exception(e)

    def create_metadata(
        self,
        key: str
        ):
        try:
            bucket = self.s3.Bucket(self._bucket_name)
            # versions = bucket.object_versions.filter(Prefix=key)
            # version_count = sum(1 for _ in versions)
            # version_number = f"v{version_count + 1}"
        
            current_datetime = datetime.now().isoformat()  

            return {
                "key": key,
                "count": "1",
                "version": "v1", 
                "status": "pending",
                "date": current_datetime
            }

        except Exception as e:
            logger.warn(f'{e}')
            raise Exception(e)

    def get_metadata(self, key: str) -> dict:
        try:
            obj = self.s3.Object(
                bucket_name=self.bucket_name, 
                key= key
            )
            metadata = obj.metadata
            return metadata
        except Exception as e:
            logger.warn(f'{e}')
            raise Exception(e)


    def key_exists(self, key: str) -> bool:
        try:
            obj = self.s3_client.head_object(Bucket=self._bucket_name, Key=key)
            return True
        except (ClientError, Exception):
            return False






   