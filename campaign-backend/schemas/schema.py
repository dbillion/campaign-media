# schemas/schema.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from decimal import Decimal
from database.database import CountryEnum
from urllib.parse import urlparse

class PayoutBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    country: CountryEnum

    class Config:
        from_attributes = True

class PayoutCreate(PayoutBase):
    pass

class PayoutResponse(PayoutBase):
    id: int
    campaign_id: int

# Update PayoutUpdate schema
class PayoutUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    country: Optional[CountryEnum] = None

    class Config:
        from_attributes = True

class CampaignBase(BaseModel):
    title: str
    landing_url: str
    is_running: bool = False

    @validator('landing_url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            v = f'https://www.{v}'
        if not v.endswith(('.com', '.org', '.net', '.edu')):
            v = f'{v}.com'
        try:
            result = urlparse(v)
            if not all([result.scheme, result.netloc]):
                raise ValueError
            return v
        except Exception:
            raise ValueError('Invalid URL format')

class CampaignCreate(CampaignBase):
    payouts: List[PayoutCreate]
    # Remove country from here since it's now in CampaignBase

class Campaign(CampaignBase):
    id: int
    payouts: List[PayoutResponse]

    class Config:
        from_attributes = True


class CampaignFilter(BaseModel):
    title: Optional[str]
    landing_url: Optional[str]
    is_running: Optional[bool]

class CampaignUpdate(BaseModel):
    title: Optional[str]
    landing_url: Optional[str]
    is_running: Optional[bool]