from fastapi.testclient import TestClient
from fastapi.encoders import jsonable_encoder
from fastapi import status
from backend.entry import app
from backend.deps import *
from backend.settings import get_settings
import pytest
from uuid import UUID
import asyncio
import httpx
from httpx import AsyncClient
from asgi_lifespan import LifespanManager
import pytest_asyncio
from pprint import pprint
import base64
import json
from datetime import datetime, date
import os
from backend.utils import logger
from fhir.resources.bundle import Bundle


settings = get_settings()

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()

        elif isinstance(obj, float):
            return float(obj)

        elif isinstance(obj, int):
            return int(obj)

        return json.JSONEncoder.default(self, obj)

class JSON_Decoder(json.JSONDecoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()

        elif isinstance(obj, float):
            return float(obj)
            # return Decimal128(obj).to_decimal()
        elif isinstance(obj, int):
            return int(obj)
        
        elif isinstance(obj, list):
            return list(map(self.default, obj))

        return json.JSONEncoder.default(self, obj)


test_guideline = 'tests/data/comm_with_patient.json'
# test_guideline = 'tests/data/plandefinition.json'

def read_json(path = test_guideline):
    with open(path, 'r', encoding='utf-8-sig') as f:
        f = json.load(f, cls=JSON_Decoder)
    return f


def write_json(path: str, data):
    with open(path, 'w', encoding='utf-8-sig') as f:
        f.write(data)
        f.close()

    return os.path.exists(path)


def decode_str(text):
    s = base64.b64decode(text)
    s = str(s, "utf-8")
    # s = json.dumps(s)
    # s = json.loads(s)
    
    return s


@pytest.fixture(scope="session")
def event_loop():
    try:
        loop = asyncio.get_running_loop()
    except (RuntimeError, Exception):
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

# @pytest.fixture
@pytest_asyncio.fixture
async def test_client():
    url = 'http://localhost:5000'
    async with LifespanManager(app):
        async with httpx.AsyncClient(
            app=app, 
            base_url=url,
            timeout=90.0
            ) as test_client:
            yield test_client

@pytest_asyncio.fixture
async def marc_hi_client():
    url = 'https://hapi-fhir.marc-hi.ca:8443/fhir'
    async with LifespanManager(app):
        async with httpx.AsyncClient(
            base_url=url
            ) as test_client:
            yield test_client

@pytest.fixture
def cql_str():
    return "bGlicmFyeSAiTGlicmFyeS1jcGduYW1lLTU1IiB2ZXJzaW9uICcxJwogICAgdXNpbmcgRkhJUiB2ZXJzaW9uICc0LjAuMScKICAgIGluY2x1ZGUgIkZISVJIZWxwZXJzIiB2ZXJzaW9uICc0LjAuMScgY2FsbGVkIEZISVJIZWxwZXJzCgogICAgLy8gQ29kZXN5c3RlbXMgYW5kIGNvZGVzCiAgICBjb2Rlc3lzdGVtICJodHRwOi8vc25vbWVkLmluZm8vc2N0IjogJ2h0dHA6Ly9zbm9tZWQuaW5mby9zY3QnCiAgICBjb2RlICJodHRwOi8vc25vbWVkLmluZm8vc2N0XzIwNDMxNTAwMCI6ICcyMDQzMTUwMDAnIGZyb20gImh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiCgpjb2Rlc3lzdGVtICJodHRwOi8vbG9pbmMub3JnIjogJ2h0dHA6Ly9sb2luYy5vcmcnCiAgICBjb2RlICJodHRwOi8vbG9pbmMub3JnX0xBMjQ2MzQtMCI6ICdMQTI0NjM0LTAnIGZyb20gImh0dHA6Ly9sb2luYy5vcmciCgogICAgLy8gQ29udGV4dAogICAgY29udGV4dCBQYXRpZW50CgogICAgLy8gRXZhbHVhdGVkIGV4cHJlc3Npb25zCiAgICAKCmRlZmluZSAiVW5pcXVlSWQwIjoKICAgICAgICBleGlzdHMoCiAgICBbQ29uZGl0aW9uXSBSCiAgICAgICAgICAgIHdoZXJlIChSLmNvZGUgfiAiaHR0cDovL3Nub21lZC5pbmZvL3NjdF8yMDQzMTUwMDAiIG9yIFIuY29kZSB+ICJodHRwOi8vbG9pbmMub3JnX0xBMjQ2MzQtMCIpKQoKZGVmaW5lICJpbmRleC00NCI6CiAgICBVbmlxdWVJZDAK"

