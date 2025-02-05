from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base, init_db
from api.routes import router as campaign_router

app = FastAPI(
    title="Campaign Management API",
    description="""
    Campaign Management System API allows you to:
    * Create and manage advertising campaigns
    * Handle country-specific payouts
    * Search and filter campaigns
    * Toggle campaign status
    * Manage campaign payouts per country
    
    ## Campaigns
    You can **create**, **read**, **update** and **delete** campaigns.
    
    ## Payouts
    Manage country-specific payouts for each campaign.
    """,
    version="1.0.0",
    contact={
        "name": "API Support",
        "email": "support@campaignapi.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[{
        "name": "campaigns",
        "description": "Operations with campaigns and their payouts",
    }]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000,http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()  # Initialize database tables on startup

app.include_router(campaign_router)

@app.get("/", 
    tags=["health"],
    summary="Health Check",
    description="Returns API health status and version information",
    response_description="Basic health check response"
)
async def root():
    return {
        "status": "healthy",
        "message": "Campaign Management API",
        "version": "1.0.0",
        "documentation": "/docs"
    }