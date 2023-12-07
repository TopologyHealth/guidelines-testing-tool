from .conftest import *

@pytest.mark.asyncio
class Test_Deps:
    
    async def test_create_guideline_dep(
        self, 
        test_client: AsyncClient
        ):
        data = standard_bundle
        # data = juniper_bundle
        b = Bundle(**data)
        dep = guideline_create(
            'test_dep_bundle.json',
             b
            )
        pprint(dep)

    async def test_read_guideline_dep(
        self, 
        test_client: AsyncClient
        ):
        dep = guideline_read(file_name= 'test_dep_bundle.json',)
        pprint(dep)


    async def test_update_guideline_dep(
        self, 
        test_client: AsyncClient
        ):
        data = standard_bundle
        # data = juniper_bundle
        b = Bundle(**data)
        dep = guideline_create(
            'test_dep_bundle.json',
             b
        )
        pprint(dep)


    async def test_delete_guideline_dep(
        self, 
        test_client: AsyncClient
        ):
        data = standard_bundle
        # data = juniper_bundle
        b = Bundle(**data)
        dep = guideline_delete(
            'test_dep_bundle.json',
            b
        )
        pprint(dep)


    async def test_list_guidelines_dep(
        self, 
        test_client: AsyncClient
        ):
        data = standard_bundle
        # data = juniper_bundle
        b = Bundle(**data)
        dep = guidelines_list(
            'test_dep_bundle.json',
            b
        )
        pprint(dep)
        