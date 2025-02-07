import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CampaignResponse } from "@/services/campaigns";
import { useUpdateCampaign } from "@/hooks/useCampaigns";

interface EditCampaignDetailsDialogProps {
  campaign: CampaignResponse;
}

export const EditCampaignDetailsDialog = ({
  campaign,
}: EditCampaignDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(campaign.title);
  const [url, setUrl] = useState(campaign.landing_url);
  const { toast } = useToast();
  const { mutate: updateCampaign } = useUpdateCampaign();

  const validateAndFormatUrl = (inputUrl: string) => {
    let formattedUrl = inputUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://www.${formattedUrl}`;
    }
    if (!formattedUrl.includes('.')) {
      formattedUrl = `${formattedUrl}.com`;
    }
    try {
      new URL(formattedUrl);
      return { isValid: true, url: formattedUrl };
    } catch {
      return { isValid: false, url: formattedUrl };
    }
  };

  const handleSubmit = () => {
    if (!title || !url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { isValid, url: formattedUrl } = validateAndFormatUrl(url);
    if (!isValid) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    updateCampaign({
      campaignId: campaign.id,
      updates: {
        title,
        landing_url: formattedUrl,
        is_running: campaign.is_running,
      },
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Campaign Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">Landing URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
