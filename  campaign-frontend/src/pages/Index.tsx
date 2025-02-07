import { useState } from "react";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { useToast } from "@/components/ui/use-toast";
import { useCampaigns, useToggleCampaignStatus, useUpdateCampaign, useCreateCampaign } from "@/hooks/useCampaigns";

const Index = () => {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payoutFilter, setPayoutFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { mutate: toggleStatus } = useToggleCampaignStatus();
  const { mutate: updateCampaign } = useUpdateCampaign();
  const { mutate: createCampaign } = useCreateCampaign();
  const { toast } = useToast();

  const handleCreateCampaign = (data: {
    title: string;
    landing_url: string;
    is_running: boolean;
    payouts: Array<{ country: string; amount: number }>;
  }) => {
    createCampaign(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Campaign created successfully",
        });
      },
    });
  };

  const handleStatusChange = (id: number) => {
    toggleStatus(id);
  };

  const handleEditCampaign = (id: number, updates: {
    title?: string;
    landing_url?: string;
    is_running?: boolean;
  }) => {
    updateCampaign({ campaignId: id, updates });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handlePayoutFilter = (payout: string) => {
    setPayoutFilter(payout);
  };

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <CreateCampaignDialog onCreateCampaign={handleCreateCampaign} />
      </div>
      <CampaignList 
        campaigns={campaigns}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onEdit={handleEditCampaign}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        payoutFilter={payoutFilter}
        sortBy={sortBy}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onPayoutFilter={handlePayoutFilter}
        onSort={handleSort}
      />
    </div>
  );
};

export default Index;