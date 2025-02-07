import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CampaignService } from '@/services/campaigns';

export const useCampaigns = (params?: {
  skip?: number;
  limit?: number;
  title?: string;
  landing_url?: string;
  is_running?: boolean;
}) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => CampaignService.getCampaigns(params).then(res => res.data),
  });
};

export const useSearchCampaigns = (query: string, params?: {
  skip?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['searchCampaigns', query, params],
    queryFn: () => CampaignService.searchCampaigns(query, params).then(res => res.data),
    enabled: !!query,
  });
};

export const useCampaign = (id: number) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => CampaignService.getCampaign(id),
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { 
      campaignId: number; 
      updates: { 
        title?: string; 
        url?: string;  // Changed from landing_url
        status?: boolean;  // Changed from is_running
      } 
    }) => CampaignService.updateCampaign(data.campaignId, data.updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] });
    },
  });
};

export const useToggleCampaignStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: number) => CampaignService.toggleCampaignStatus(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { 
      title: string;
      landing_url: string;
      is_running: boolean;
      payouts: { country: string; amount: number; }[];
    }) => CampaignService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => CampaignService.getCountries().then(res => res.data),
  });
};

export const usePayouts = (campaignId: number) => {
  return useQuery({
    queryKey: ['payouts', campaignId],
    queryFn: () => CampaignService.getPayouts(campaignId).then(res => res.data),
  });
};

export const useCreatePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      campaignId: number;
      payout: { country: string; amount: number; }
    }) => CampaignService.createPayout(data.campaignId, data.payout),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['payouts', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdatePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      payoutId: number;
      updates: { country?: string; amount?: number }
    }) => CampaignService.updatePayout(data.payoutId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
};

export const useDeletePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CampaignService.deletePayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CampaignService.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};