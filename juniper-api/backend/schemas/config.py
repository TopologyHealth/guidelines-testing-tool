from pydantic import BaseModel


class BaseConfig(BaseModel):
    allow_population_by_field_name = True
    arbitrary_types_allowed = True


