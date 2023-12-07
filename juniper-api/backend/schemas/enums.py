from enum import Enum

class DateInterval(str, Enum):
    month = 'month'
    year = 'year'
    week = 'week'
    day = 'day'
