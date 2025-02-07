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
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface Campaign {
  id: string;
  title: string;
  url: string;
  status: "running" | "stopped";
  payouts: Payout[];
}

interface CreateCampaignDialogProps {
  onCreateCampaign: (data: {
    title: string;
    landing_url: string;
    is_running: boolean;
    payouts: Array<{
      country: string;
      amount: number;
    }>;
  }) => void;
}

export const CreateCampaignDialog = ({
  onCreateCampaign,
}: CreateCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [payouts, setPayouts] = useState<Payout[]>([
    { country: "", amount: 0 },
  ]);
  const { toast } = useToast();

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

    onCreateCampaign({
      title,
      landing_url: formattedUrl,
      is_running: false,
      payouts: payouts.map(p => ({
        country: p.country,
        amount: p.amount
      }))
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setPayouts([{ country: "", amount: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Campaign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Create a new advertising campaign with country-specific payouts.
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
              className="mt-2"
              onClick={() => setPayouts([...payouts, { country: "", amount: 0 }])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Payout
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Create Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};