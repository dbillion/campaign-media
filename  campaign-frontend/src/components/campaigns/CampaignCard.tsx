import { CampaignResponse } from "@/services/campaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditCampaignDetailsDialog } from "./EditCampaignDetailsDialog";
import { EditPayoutDialog } from "./EditPayoutDialog";
import { useToggleCampaignStatus, useUpdateCampaign, useDeleteCampaign } from "@/hooks/useCampaigns";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

interface CampaignCardProps {
  campaign: CampaignResponse;
}

export const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const { mutate: toggleStatus } = useToggleCampaignStatus();
  const { mutate: updateCampaign } = useUpdateCampaign();
  const { mutate: deleteCampaign } = useDeleteCampaign();
  const { toast } = useToast();
  const [editPayoutOpen, setEditPayoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleStatusChange = () => {
    toggleStatus(campaign.id, {
      onSuccess: () => {
        toast({
          title: "Status Updated",
          description: `Campaign is now ${!campaign.is_running ? 'running' : 'stopped'}`
        });
      }
    });
  };

  const handleEditCampaign = (updates: {
    title?: string;
    url?: string;
    status?: boolean;
  }) => {
    updateCampaign({
      campaignId: campaign.id,
      updates: {
        ...updates,
        status: campaign.is_running // Preserve existing status
      }
    });
  };

  const handleDelete = () => {
    deleteCampaign(campaign.id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Campaign deleted successfully"
        });
      }
    });
  };

  // URL Validation Function (Optional)
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getRouteUrl = (url: string) => {
    return encodeURIComponent(url.replace(/^https?:\/\//, ''));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle 
          className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/campaigns/${getRouteUrl(campaign.landing_url)}`)}
        >
          {campaign.title}
        </CardTitle>
        <div className="flex items-center gap-2">
        <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditPayoutOpen(true)}
            >
              <CreditCard className="h-4 w-4" />
            </Button>
          <EditCampaignDetailsDialog 
            campaign={campaign} 
            onEdit={handleEditCampaign} 
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{campaign.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Switch
            checked={campaign.is_running}
            onCheckedChange={handleStatusChange}
          />


        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <a
              href={campaign.landing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-700 break-all"
            >
              {isValidUrl(campaign.landing_url) ? campaign.landing_url : "Invalid URL"}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {campaign.payouts.map((payout) => (
              <Badge 
                key={payout.id} 
                variant="secondary"
                className="flex justify-between items-center px-3 py-1"
              >
                <span>{payout.country}</span>
                <span className="font-medium">${payout.amount}</span>
              </Badge>
            ))}
          </div>
          <Badge 
            variant={campaign.is_running ? "success" : "destructive"}
            className="w-fit"
          >
            {campaign.is_running ? "Running" : "Stopped"}
          </Badge>
        </div>
      </CardContent>
      <EditPayoutDialog
        open={editPayoutOpen}
        onOpenChange={setEditPayoutOpen}
        campaignId={campaign.id}
      />
    </Card>
  );
};