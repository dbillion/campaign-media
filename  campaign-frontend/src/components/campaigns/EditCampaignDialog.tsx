import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PayoutInput, Payout } from "./PayoutInput";
import { Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CampaignResponse } from "@/services/campaigns";

interface EditCampaignDialogProps {
  campaign: CampaignResponse;
  onEdit: (id: number, updates: {
    title?: string;
    landing_url?: string;
    is_running?: boolean;
  }) => void;
}

export const EditCampaignDialog = ({
  campaign,
  onEdit,
}: EditCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(campaign.title);
  const [url, setUrl] = useState(campaign.landing_url);
  const [payouts, setPayouts] = useState<Payout[]>(campaign.payouts);
  const { toast } = useToast();

  const validateAndFormatUrl = (inputUrl: string) => {
    let formattedUrl = inputUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
      return { isValid: true, url: formattedUrl };
    } catch {
      return { isValid: false, url: formattedUrl };
    }
  };

  const handleSubmit = () => {
    if (!title || !url || payouts.some((p) => !p.country || !p.amount)) {
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
        description: "Please enter a valid URL (e.g., www.example.com or https://example.com)",
        variant: "destructive",
      });
      return;
    }

    onEdit(campaign.id, {
      title,
      landing_url: formattedUrl,
    });
    setOpen(false);
    toast({
      title: "Campaign Updated",
      description: "Your campaign has been updated successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby="campaign-dialog-description" className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription id="campaign-dialog-description">
            Make changes to your campaign settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campaign title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">Landing Page URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="www.example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>Payouts</Label>
            {payouts.map((payout, index) => (
              <PayoutInput
                key={index}
                payout={payout}
                onUpdate={(updatedPayout) => {
                  const newPayouts = [...payouts];
                  newPayouts[index] = updatedPayout;
                  setPayouts(newPayouts);
                }}
                onRemove={() => {
                  if (payouts.length > 1) {
                    setPayouts(payouts.filter((_, i) => i !== index));
                  }
                }}
              />
            ))}
            <Button
              variant="outline"
              onClick={() => setPayouts([...payouts, { country: "", amount: 0 }])}
            >
              Add Payout
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};