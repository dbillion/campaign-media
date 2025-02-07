import { CampaignCard } from "./CampaignCard";
import { SearchBar } from "./SearchBar";
import { CampaignResponse } from "@/services/campaigns";

interface CampaignListProps {
  campaigns: CampaignResponse[];
  isLoading: boolean;
  onStatusChange: (id: number) => void;
  onEdit: (id: number, updates: any) => void;
  searchQuery: string;
  statusFilter: string;
  payoutFilter: string;
  sortBy: string;
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  onPayoutFilter: (amount: string) => void;
  onSort: (criteria: string) => void;
}

export const CampaignList = ({ 
  campaigns, 
  isLoading,
  onStatusChange,
  onEdit,
  searchQuery,
  statusFilter,
  payoutFilter,
  sortBy,
  onSearch,
  onStatusFilter,
  onPayoutFilter,
  onSort
}: CampaignListProps) => {

  const getMaxPayout = (campaign: CampaignResponse) => {
    return Math.max(...campaign.payouts.map(p => p.amount));
  };

  const isInPayoutRange = (campaign: CampaignResponse, range: string) => {
    const maxPayout = getMaxPayout(campaign);
    switch (range) {
      case "0-50": return maxPayout <= 50;
      case "51-100": return maxPayout > 50 && maxPayout <= 100;
      case "101-500": return maxPayout > 100 && maxPayout <= 500;
      case "501+": return maxPayout > 500;
      default: return true;
    }
  };

  const sortCampaigns = (campaigns: CampaignResponse[]) => {
    switch (sortBy) {
      case "newest":
        return [...campaigns].reverse();
      case "oldest":
        return [...campaigns];
      case "title-asc":
        return [...campaigns].sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return [...campaigns].sort((a, b) => b.title.localeCompare(a.title));
      case "payout-high":
        return [...campaigns].sort((a, b) => getMaxPayout(b) - getMaxPayout(a));
      case "payout-low":
        return [...campaigns].sort((a, b) => getMaxPayout(a) - getMaxPayout(b));
      default:
        return campaigns;
    }
  };

  const filteredCampaigns = sortCampaigns(campaigns.filter((campaign) => {
    const title = campaign?.title || '';
    const landingUrl = campaign?.landing_url || '';
    const isRunning = campaign?.is_running;
    
    const matchesSearch = searchQuery
      ? title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landingUrl.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesStatus = 
      statusFilter === "all" || 
      isRunning === (statusFilter === "true");

    const matchesPayout = payoutFilter === "all" || isInPayoutRange(campaign, payoutFilter);

    return matchesSearch && matchesStatus && matchesPayout;
  }));

  return (
    <div className="space-y-4">
      <SearchBar 
        onSearch={onSearch}
        onStatusFilter={onStatusFilter}
        onPayoutFilter={onPayoutFilter}
        onSortBy={onSort}
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};