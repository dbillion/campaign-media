import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { PayoutInput } from "./PayoutInput";
import { useCreatePayout, useDeletePayout, usePayouts } from "@/hooks/useCampaigns";
import { isValidUrl } from "@/lib/validations";

interface EditPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: number;  // Changed to number
}

export const EditPayoutDialog = ({
  open,
  onOpenChange,
  campaignId,
}: EditPayoutDialogProps) => {
  const [payouts, setPayouts] = useState<Array<{ id?: number; country: string; amount: number }>>([]);
  const { data: existingPayouts, isLoading } = usePayouts(campaignId);
  const createPayout = useCreatePayout();
  const deletePayout = useDeletePayout();
  const { toast } = useToast();

  useEffect(() => {
    if (existingPayouts?.length) {
      setPayouts(existingPayouts);
    }
  }, [existingPayouts]);

  const handleAddPayout = () => {
    setPayouts([...payouts, { country: "", amount: 0 }]);
  };

  const handleRemovePayout = async (index: number) => {
    const payout = payouts[index];
    if (payout.id) {
      await deletePayout.mutateAsync(payout.id);
    }
    setPayouts(payouts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validate payouts
    const invalidPayouts = payouts.some(p => !p.country || p.amount <= 0);
    if (invalidPayouts) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    try {
      // Handle deletions
      const removedPayouts = existingPayouts?.filter(
        ep => !payouts.some(p => p.id === ep.id)
      ) || [];

      for (const payout of removedPayouts) {
        await deletePayout.mutateAsync(payout.id);
      }

      // Handle additions
      for (const payout of payouts) {
        if (!payout.country || !payout.amount) continue;

        if (!payout.id) {
          await createPayout.mutateAsync({
            campaignId,
            payout: {
              country: payout.country,
              amount: payout.amount
            }
          });
        }
      }

      toast({
        title: "Success",
        description: "Payouts updated successfully"
      });
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payouts",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="payout-dialog-description">
        <DialogHeader>
          <DialogTitle>Edit Payouts</DialogTitle>
          <DialogDescription id="payout-dialog-description">
            Add or modify payout amounts for different countries.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading payouts...</div>
          ) : (
            <>
              {payouts.map((payout, index) => (
                <PayoutInput
                  key={index}
                  payout={payout}
                  onUpdate={(updated) => {
                    const newPayouts = [...payouts];
                    newPayouts[index] = updated;
                    setPayouts(newPayouts);
                  }}
                  onRemove={() => handleRemovePayout(index)}
                />
              ))}
              <Button 
                onClick={handleAddPayout}
                className="w-full"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payout
              </Button>
            </>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSave}
            disabled={isLoading || createPayout.isPending || deletePayout.isPending}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
