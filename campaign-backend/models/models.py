# models/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship, validates
from database.database import Base, CountryEnum
from urllib.parse import urlparse

def validate_and_transform_url(url: str) -> str:
    """Transform and validate URL"""
    if not url.startswith(('http://', 'https://')):
        url = f'https://www.{url}'
    if not url.endswith(('.com', '.org', '.net', '.edu')):
        url = f'{url}.com'
    return url

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Default Campaign")
    landing_url = Column(String, default="#")
    is_running = Column(Boolean, default=True)
    payouts = relationship("Payout", back_populates="campaign")

    @validates('landing_url')
    def validate_url(self, key, url):
        return validate_and_transform_url(url)

class Payout(Base):
    __tablename__ = "payouts"
    
    id = Column(Integer, primary_key=True, index=True)
    country = Column(Enum(CountryEnum), nullable=False)
    amount = Column(Float, nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    campaign = relationship("Campaign", back_populates="payouts")