import pytest
from fastapi.testclient import TestClient

def test_create_campaign(client):
    response = client.post("/api/campaigns/campaigns/", json={
        "title": "Test Campaign",
        "landing_url": "http://test.com",
        "is_running": True,
        "payouts": [
            {
                "country": "USA",
                "amount": 100.00
            }
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Campaign"
    assert len(data["payouts"]) == 1

def test_get_countries(client):
    response = client.get("/api/campaigns/countries")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_get_campaigns(client):
    response = client.get("/api/campaigns/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_and_delete_payout(client):
    # First create a campaign
    campaign_response = client.post("/api/campaigns/campaigns/", json={
        "title": "Test Campaign",
        "landing_url": "http://test.com",
        "is_running": True,
        "payouts": []
    })
    campaign_id = campaign_response.json()["id"]
    
    # Create a payout
    payout_response = client.post(f"/api/campaigns/{campaign_id}/payouts/", json={
        "country": "USA",
        "amount": 100.00
    })
    assert payout_response.status_code == 200
    payout_id = payout_response.json()["id"]
    
    # Delete the payout
    delete_response = client.delete(f"/api/campaigns/payouts/{payout_id}")
    assert delete_response.status_code == 204