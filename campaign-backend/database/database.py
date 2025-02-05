import os
import json
from decouple import config
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from enum import Enum
from dataclasses import dataclass
from typing import Dict, Optional

class DatabaseConfig:
    def __init__(self):
        self.user = config('POSTGRES_USER', default=None)
        self.password = config('POSTGRES_PASSWORD', default=None)
        self.db = config('POSTGRES_DB', default=None)
        self.host = config('POSTGRES_HOST', default='localhost')
        self.port = config('POSTGRES_PORT', default='5432')

    @property
    def is_postgres_configured(self) -> bool:
        return all([self.user, self.password, self.db])

    def get_database_url(self) -> str:
        if self.is_postgres_configured:
            return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.db}"
        return "sqlite:///./sql_app.db"

db_config = DatabaseConfig()
SQLALCHEMY_DATABASE_URL = db_config.get_database_url()

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

@dataclass
class CountryData:
    name: str
    code: str
    currency_code: str
    currency_name: str

class CountryEnum(str, Enum):
    """Dynamic Enum class for countries"""
    pass

class CountryManager:
    _instance = None
    countries: Dict[str, CountryData] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._load_countries()
        return cls._instance

    @classmethod
    def _load_countries(cls):
        """Load countries from JSON file and create enum members"""
        with open(os.path.join(os.path.dirname(__file__), 'countries.json')) as f:
            data = json.load(f)

        # Create enum members dynamically using country codes
        country_members = {
            country["COUNTRY_CODE"]: country["COUNTRY_CODE"]
            for country in data["countries"]
        }
        global CountryEnum
        CountryEnum = Enum('CountryEnum', country_members, type=str)

        # Store country data
        cls.countries = {
            country["COUNTRY_CODE"]: CountryData(
                name=country["COUNTRY"],
                code=country["COUNTRY_CODE"],
                currency_code=country["CURRENCY_CODE"],
                currency_name=country["NAME_OF_CURRENCY"]
            )
            for country in data["countries"]
        }

    @classmethod
    def get_country_data(cls, country_code: str) -> Optional[CountryData]:
        return cls.countries.get(country_code)

# Initialize CountryManager
country_manager = CountryManager()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)