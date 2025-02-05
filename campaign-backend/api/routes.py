from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from database.database import get_db
from schemas.schema import (
    Campaign,
    CampaignCreate,
    CampaignUpdate,
    CampaignFilter,
    PayoutResponse,
    PayoutCreate,
    PayoutUpdate
)
from service.service import campaign_service, payout_service, PayoutError

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

# Move countries endpoint before dynamic routes
@router.get("/countries", response_model=List[Dict])
async def get_countries():
    """Get available countries for campaign creation"""
    try:
        return payout_service.get_available_countries()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/", response_model=Campaign)
def create_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new campaign with associated payouts
    """
    return campaign_service.create_campaign(db, campaign)

@router.get("/", response_model=List[Campaign])
async def get_campaigns(
    skip: int = 0,
    limit: int = 100,
    title: Optional[str] = None,
    landing_url: Optional[str] = None,
    is_running: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Get all campaigns with optional filtering
    """
    filters = CampaignFilter(
        title=title,
        landing_url=landing_url,
        is_running=is_running
    )
    return campaign_service.get_campaigns(db, skip, limit, filters)

@router.get("/search", response_model=List[Campaign])
async def search_campaigns(
    q: str = Query(..., min_length=1, description="Search term"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Search campaigns by title or landing URL
    """
    return campaign_service.search_campaigns(db, q, skip, limit)

@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific campaign by ID
    """
    campaign = campaign_service.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.patch("/{campaign_id}", response_model=Campaign)
async def update_campaign(
    campaign_id: int,
    campaign_update: CampaignUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a campaign's details
    """
    campaign = campaign_service.update_campaign(db, campaign_id, campaign_update)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.patch("/{campaign_id}/toggle", response_model=Campaign)
async def toggle_campaign_status(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """
    Toggle campaign running status
    """
    campaign = campaign_service.toggle_campaign_status(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

# Add these new endpoints for payout management
@router.post("/{campaign_id}/payouts/", response_model=PayoutResponse)
async def create_payout(
    campaign_id: int,
    payout: PayoutCreate,
    db: Session = Depends(get_db)
):
    """Create a new payout for a campaign"""
    try:
        # First verify campaign exists
        campaign = campaign_service.get_campaign(db, campaign_id)
        if not campaign:
            raise HTTPException(
                status_code=404,
                detail=f"Campaign {campaign_id} not found"
            )

        return campaign_service.create_payout(db, campaign_id, payout)
    except PayoutError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}/payouts/", response_model=List[PayoutResponse])
async def get_campaign_payouts(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """Get all payouts for a campaign"""
    return campaign_service.get_campaign_payouts(db, campaign_id)

@router.patch("/payouts/{payout_id}", response_model=PayoutResponse)
async def update_payout(
    payout_id: int,
    payout_update: PayoutUpdate,
    db: Session = Depends(get_db)
):
    """Update a payout"""
    try:
        updated_payout = payout_service.update_payout(db, payout_id, payout_update)
        if not updated_payout:
            raise HTTPException(status_code=404, detail=f"Payout {payout_id} not found")
        return updated_payout
    except PayoutError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/payouts/{payout_id}", status_code=204)
async def delete_payout(
    payout_id: int,
    db: Session = Depends(get_db)
):
    """Delete a specific payout"""
    try:
        success = payout_service.delete_payout(db, payout_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Payout {payout_id} not found")
        return {"status": "success"}
    except PayoutError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """Delete a campaign and its associated payouts"""
    try:
        success = campaign_service.delete_campaign(db, campaign_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Campaign {campaign_id} not found"
            )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
