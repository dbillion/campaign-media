import { apiClient } from '@/lib/axios';
import { Campaign, CountryData } from '@/types';

export const campaignApi = {
  getCountries: async () => {
    const { data } = await apiClient.get<CountryData[]>('/campaigns/countries');
    return data;
  },
  
  createCampaign: async (campaign: Campaign) => {
    const { data } = await apiClient.post<Campaign>('/campaigns', campaign);
    return data;
  },
  // ... other campaign endpoints
};