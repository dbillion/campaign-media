import logging
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List, Optional
from models.models import Campaign, Payout
from schemas.schema import PayoutCreate, CampaignCreate, CampaignUpdate, CampaignFilter, PayoutUpdate
from database.database import CountryEnum, country_manager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PayoutError(Exception):
    """Base exception for payout operations"""
    pass

class PayoutService:
    def get_available_countries(self) -> List[dict]:
        """Get countries with currency info for campaign creation form"""
        try:
            return [
                {
                    "name": data.name,
                    "code": data.code,
                    "currency_code": data.currency_code,
                    "currency_name": data.currency_name,
                    "enum_value": country_name.replace(" ", "_"),
                    "display_name": f"{data.name} ({data.currency_code})"
                }
                for country_name, data in country_manager.countries.items()
            ]
        except Exception as e:
            logger.error(f"Error fetching countries: {str(e)}")
            raise PayoutError("Failed to fetch countries")

    def create_payout(self, db: Session, payout: PayoutCreate, campaign_id: int) -> Payout:
        try:
            # Validate amount and currency
            if payout.amount <= Decimal('0'):
                raise PayoutError("Payout amount must be greater than 0")

            country_data = country_manager.get_country_data(payout.country.value)
            if not country_data:
                raise PayoutError(f"Invalid country: {payout.country}")

            # Check for duplicate country in campaign
            existing = db.query(Payout).filter(
                Payout.campaign_id == campaign_id,
                Payout.country == payout.country
            ).first()
            if existing:
                raise PayoutError(f"Payout for {payout.country} already exists")

            # Create payout with currency info
            db_payout = Payout(
                country=payout.country,
                amount=payout.amount,
                campaign_id=campaign_id,
                currency_code=country_data.currency_code
            )
            db.add(db_payout)
            db.commit()
            db.refresh(db_payout)
            
            logger.info(f"Created payout: {payout.amount} {country_data.currency_code}")
            return db_payout

        except Exception as e:
            db.rollback()
            logger.error(f"Payout creation failed: {str(e)}")
            raise PayoutError(str(e))

    def update_payout(self, db: Session, payout_id: int, payout_update: PayoutUpdate) -> Optional[Payout]:
            try:
                payout = db.query(Payout).filter(Payout.id == payout_id).first()
                if not payout:
                    return None

                update_data = payout_update.model_dump(exclude_unset=True)
                for field, value in update_data.items():
                    setattr(payout, field, value)

                db.commit()
                db.refresh(payout)
                return payout

            except Exception as e:
                db.rollback()
                logger.error(f"Error updating payout: {str(e)}")
                raise PayoutError(str(e))

    def delete_payout(self, db: Session, payout_id: int) -> bool:
        try:
            payout = db.query(Payout).filter(Payout.id == payout_id).first()
            if not payout:
                raise PayoutError(f"Payout {payout_id} not found")

            db.delete(payout)
            db.commit()
            
            logger.info(f"Deleted payout {payout_id}")
            return True

        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting payout: {str(e)}")
            raise PayoutError(f"Failed to delete payout: {str(e)}")

    def get_payouts_by_country(self, db: Session, country: CountryEnum) -> List[Payout]:
        try:
            payouts = db.query(Payout).filter(Payout.country == country).all()
            logger.info(f"Retrieved {len(payouts)} payouts for country {country}")
            return payouts
        except Exception as e:
            logger.error(f"Error retrieving payouts: {str(e)}")
            raise PayoutError(f"Failed to retrieve payouts: {str(e)}")

    def get_all_payouts(self, db: Session, skip: int = 0, limit: int = 100) -> List[Payout]:
        return db.query(Payout).offset(skip).limit(limit).all()

payout_service = PayoutService()

class CampaignService:
    def get_campaigns(self, db: Session, skip: int = 0, limit: int = 100, filters: Optional[CampaignFilter] = None) -> List[Campaign]:
        query = db.query(Campaign)
        
        if filters:
            if filters.title:
                query = query.filter(Campaign.title.ilike(f"%{filters.title}%"))
            if filters.landing_url:
                query = query.filter(Campaign.landing_url.ilike(f"%{filters.landing_url}%"))
            if filters.is_running is not None:
                query = query.filter(Campaign.is_running == filters.is_running)
                
        return query.offset(skip).limit(limit).all()
    
    def get_campaign(self, db: Session, campaign_id: int) -> Optional[Campaign]:
        """Get campaign by ID with verification"""
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            logger.error(f"Campaign {campaign_id} not found")
            return None
        return campaign
    
    def create_campaign(self, db: Session, campaign_data: CampaignCreate) -> Campaign:
        # Create campaign
        db_campaign = Campaign(
            title=campaign_data.title,
            landing_url=campaign_data.landing_url,
            is_running=campaign_data.is_running,
            
        )
        
        db.add(db_campaign)
        db.commit()
        db.refresh(db_campaign)

        # Create associated payouts
        for payout_data in campaign_data.payouts:
            payout = Payout(
                country=payout_data.country,
                amount=payout_data.amount,
                campaign_id=db_campaign.id
            )
            db.add(payout)
        
        db.commit()
        db.refresh(db_campaign)
        return db_campaign

    def update_campaign(self, db: Session, campaign_id: int, campaign_update: CampaignUpdate) -> Optional[Campaign]:
        campaign = self.get_campaign(db, campaign_id)
        if not campaign:
            return None
            
        for field, value in campaign_update.model_dump(exclude_unset=True).items():
            setattr(campaign, field, value)
            
        db.commit()
        db.refresh(campaign)
        return campaign

    def toggle_campaign_status(self, db: Session, campaign_id: int) -> Optional[Campaign]:
        campaign = self.get_campaign(db, campaign_id)
        if not campaign:
            return None
            
        campaign.is_running = not campaign.is_running
        db.commit()
        db.refresh(campaign)
        return campaign

    def search_campaigns(self, db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[Campaign]:
        return db.query(Campaign).filter(
        Campaign.title.ilike(f"%{search_term}%") |
        Campaign.landing_url.ilike(f"%{search_term}%")
    ).offset(skip).limit(limit).all()


    def delete_payout(self, db: Session, payout_id: int) -> bool:
        return payout_service.delete_payout(db, payout_id)

    def get_campaign_payouts(self, db: Session, campaign_id: int) -> List[Payout]:
        """Get all payouts for a specific campaign"""
        try:
            campaign = self.get_campaign(db, campaign_id)
            if not campaign:
                raise PayoutError(f"Campaign {campaign_id} not found")

            payouts = db.query(Payout).filter(
                Payout.campaign_id == campaign_id
            ).all()
            
            logger.info(f"Retrieved {len(payouts)} payouts for campaign {campaign_id}")
            return payouts

        except Exception as e:
            logger.error(f"Error retrieving campaign payouts: {str(e)}")
            raise PayoutError(f"Failed to retrieve payouts: {str(e)}")

    def create_payout(self, db: Session, campaign_id: int, payout_data: PayoutCreate) -> Payout:
        """Create a new payout for a campaign"""
        try:
            # Verify campaign exists
            campaign = self.get_campaign(db, campaign_id)
            if not campaign:
                logger.error(f"Campaign {campaign_id} not found")
                raise PayoutError(f"Campaign {campaign_id} not found")

            # Create payout
            db_payout = Payout(
                country=payout_data.country,
                amount=float(payout_data.amount),
                campaign_id=campaign_id
            )
            
            db.add(db_payout)
            db.commit()
            db.refresh(db_payout)
            
            logger.info(f"Created payout for campaign {campaign_id}")
            return db_payout

        except Exception as e:
            db.rollback()
            logger.error(f"Error creating payout: {str(e)}")
            raise PayoutError(str(e))

    def delete_campaign(self, db: Session, campaign_id: int) -> bool:
        """Delete a campaign and its associated payouts"""
        try:
            campaign = self.get_campaign(db, campaign_id)
            if not campaign:
                return False
                
            db.delete(campaign)
            db.commit()
            logger.info(f"Deleted campaign {campaign_id}")
            return True
                
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting campaign: {str(e)}")
            raise PayoutError(str(e))

# Create an instance to be imported by other modules
campaign_service = CampaignService()