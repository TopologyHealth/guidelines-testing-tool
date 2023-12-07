
# https://fastapi.tiangolo.com/tutorial/handling-errors/?h=#install-custom-exception-handlers

class EnumException(Exception):
    def __init__(self, error_message: str):
        self.error_message = error_message

class UserNotFoundException(Exception):
    def __init__(self, error_message: str):
        self.error_message = error_message

