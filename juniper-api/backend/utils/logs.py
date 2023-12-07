import logging
from os import environ
from typing import Optional
import os

def setup_logger(which_logger: Optional[str] = None):
    logging.basicConfig(
        filename=f'{os.getcwd()}/logs.log',
        # filename=environ.get('LOG_FILE_PATH'),# taken from loca .env file, not set in settings.py
        format='%(asctime)s - %(process)d-%(levelname)s-%(funcName)s - %(message)s', 
        datefmt='%d-%b-%y %H:%M:%S',
        level=logging.INFO
        )
    # log = logging.getLogger(which_logger)
    log = logging.getLogger()
    return log


WHICH_LOGGER = environ.get('WHICH_LOGGER', None)
# assert WHICH_LOGGER is not None, 'Set WHICH_LOGGER'
logger = setup_logger(WHICH_LOGGER)


def lambda_logger(datefmt='%d-%b-%y %H:%M'):
    import sys
    logging.basicConfig(
        format='%(levelname)s - %(message)s',
        datefmt=datefmt,
        stream=sys.stdout,
        level=logging.DEBUG,
        force=True
    )
    log = logging.getLogger()
    return log


