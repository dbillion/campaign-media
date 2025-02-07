export interface Country {
  name: string;
  code: string;
  currency_code: string;
  currency_name: string;
  enum_value: string;
  display_name: string;
}

export interface Campaign {
    id: number; 
    title: string;
    landing_url: string; 
    is_running: boolean;  
    payouts: Payout[];
  }
  
  export interface Payout {
    id?: number;
    amount: number;
    country: string;
    campaign_id?: number;
  }