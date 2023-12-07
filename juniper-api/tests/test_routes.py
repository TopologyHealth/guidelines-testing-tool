from .conftest import *

'''
orig
"2014-08-18T01:43:30Z"
'''
'''
json 
2014-08-18T01:43:30+00:00" 
'''

'''
Notes:
- it doesnt matter what the type is in S3 buckets.
    - data gets serialized when it is read.
- we dont care what its stored as in S3

Testing Process:

1. Test our data with pydantic schema validation.
2. test dependancies
3. test routes


TODO
- look up meta|datetime format of the field is.
    - in the fhir docs for Bundle
- Use custom serializer to format that datetime

https://www.hl7.org/fhir/bundle.html
'''
@pytest.mark.asyncio
class Test_Guideline:

    @pytest.mark.parametrize(
    "description,data", 
    [
        (
            'standard bundle',
            standard_bundle
        ),
        (
            'standard bundle',
            standard_bundle
        )
    ])
    async def test_python_to_pydantic(
        self,
        description,
        data
        ):
        print(description)
        b = Bundle(**data)
        pprint(b)

    async def test_pydantic_to_python(self):
        data = standard_bundle
        # data = juniper_bundle
        b = Bundle(**data)
        to_python = b.dict()
        pprint(to_python)

    async def test_pydantic_to_json(self):
        data = standard_bundle
        # data = juniper_bundle
        b = Bundle(**data)
        to_json = b.json()
        pprint(to_json)

    async def test_create_guideline(
        self, 
        test_client: AsyncClient
        ):
        data = standard_bundle
        # data = juniper_bundle
        response = await test_client.post(
            '/create/guideline',
            json=data, 
            params={"file_name": 'test_create.json'}
        )
        print(response.json())
        assert response.status_code == status.HTTP_200_OK



    async def test_read_guideline(
        self, 
        test_client: AsyncClient
        ):
        response = await test_client.get(
            '/read/guideline', 
            params={"file_name" : "test_create.json"}
        )
        pprint(response.json())
        assert response.status_code == status.HTTP_200_OK





    async def test_update_guideline(
        self, 
        test_client: AsyncClient
        ):
        # data = standard_bundle
        data = standard_bundle_updated
        # data = juniper_bundle
        response = await test_client.put(
            '/update/guideline', 
            json=data, 
            params={"file_name": "test_create.json"})
        assert response.status_code == status.HTTP_200_OK

    
    async def test_list_guidelines(
        self, 
        test_client: AsyncClient
        ):
        response = await test_client.get('/list/guidelines')
        assert response.status_code == status.HTTP_200_OK


    # To check that the fhir bundle that is downloaded from s3 
    # conforms to fhir specification and is uploadable again
    async def test_downloaded_file_is_uploadable(
        self, 
        test_client: AsyncClient
        ):
        response1 = await test_client.get(
            '/read/guideline', 
            params={"file_name" : "test_create.json"}
        )
        data = response1.json()

        response2 = await test_client.put(
            '/update/guideline',
            json=data, 
            params={"file_name": 'test_create.json'}
        )
        assert response2.status_code == status.HTTP_200_OK

    async def test_delete_guideline(
        self, 
        test_client: AsyncClient
        ):
        response = await test_client.delete(
            '/delete/guideline', 
            params={"file_name": 'test_create.json'}
            )
        assert response.status_code == status.HTTP_200_OK




