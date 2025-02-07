import { Country } from '@/types';
import axios from 'axios';
import { validateAndTransformUrl } from '@/utils/url';




import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "./api";






// Other existing code and exports

export type CampaignParams = {
  skip?: number;
  limit?: number;
  title?: string;
  landing_url?: string;
  is_running?: boolean;
};

export type CampaignResponse = {
  id: number;
  title: string;
  landing_url: string;
  is_running: boolean;
  payouts: PayoutResponse[];
};

export type PayoutResponse = {
  id: number;
  amount: number;
  country: string;
  campaign_id: number;
};

export const CampaignService = {
  // Get all campaigns
  getCampaigns: (params?: CampaignParams) => 
    axios.get<CampaignResponse[]>('/api/campaigns/', { params }),

  // Search campaigns
  searchCampaigns: (query: string, params?: { skip?: number; limit?: number }) =>
    axios.get<CampaignResponse[]>('/api/campaigns/search', { 
      params: { q: query, ...params } 
    }),

  // Get single campaign
  getCampaign: (campaignId: number) =>
    axios.get<CampaignResponse>(`/api/campaigns/${campaignId}`),

  // Update campaign
  updateCampaign: (campaignId: number, data: {
    title?: string;
    landing_url?: string;
    is_running?: boolean;
  }) => {
    const transformedData = {
      ...data,
      landing_url: data.landing_url ? validateAndTransformUrl(data.landing_url) : undefined
    };
    return axios.patch<CampaignResponse>(`/api/campaigns/${campaignId}`, transformedData);
  },

  // Delete campaign
  deleteCampaign: (campaignId: number) =>
    axios.delete(`/api/campaigns/${campaignId}`),

  // Toggle campaign status
  toggleCampaignStatus: (campaignId: number) =>
    axios.patch<CampaignResponse>(`/api/campaigns/${campaignId}/toggle`),

  // Get countries
  getCountries: () => 
    axios.get<Country[]>('/api/campaigns/countries'),

  // Create campaign  
  createCampaign: (data: {
    title: string;
    landing_url: string;
    is_running: boolean;
    payouts: Array<{ country: string; amount: number }>;
  }) => {
    const transformedData = {
      ...data,
      landing_url: validateAndTransformUrl(data.landing_url)
    };
    return axios.post<CampaignResponse>('/api/campaigns/campaigns/', transformedData);
  },

  // Payout operations
  createPayout: (campaignId: number, data: {
    country: string;
    amount: number;
  }) => axios.post<PayoutResponse>(`/api/campaigns/${campaignId}/payouts/`, data),

  getPayouts: (campaignId: number) => 
    axios.get<PayoutResponse[]>(`/api/campaigns/${campaignId}/payouts/`),

  updatePayout: (payoutId: number, data: {
    country?: string;
    amount?: number;
  }) => axios.patch<PayoutResponse>(`/api/campaigns/payouts/${payoutId}`, data),

  deletePayout: (payoutId: number) => 
    axios.delete(`/api/campaigns/payouts/${payoutId}`),

  // Get campaign by URL
  getCampaignByUrl: (url: string) => 
    axios.get<CampaignResponse>(`/api/campaigns/url/${encodeURIComponent(url)}`),
};