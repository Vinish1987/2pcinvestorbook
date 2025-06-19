import { useState, useEffect, useCallback, FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { investmentService, UserInvestment } from "@/services/investmentService";
import settingsService from "@/services/settingsService";

export interface AddInvestorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onInvestorAdded: () => void;
  investorToEdit?: UserInvestment | null;
  onInvestorUpdated?: () => void;
}

const initialFormData = {
  name: "",
  email: "",
  phone_number: "",
  invested_amount: "",
  investment_date: "",
  investment_type: "Monthly" as "Daily" | "Monthly" | "One-time",
  return_percentage: "2.00",
  monthly_payout: "",
  upi_transaction_id: "",
  total_paid_out: "0",
  notes: "",
  status: "Active" as "Active" | "Inactive",
};

export default function AddInvestorDialog({
  isOpen,
  onOpenChange,
  onInvestorAdded,
  investorToEdit,
  onInvestorUpdated,
}: AddInvestorDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [defaultReturnPercentage, setDefaultReturnPercentage] = useState(2.00);

  const calculateMonthlyPayout = useCallback(
    (amount: string, returnRate?: number) => {
      const investedAmount = parseFloat(amount) || 0;
      const rate = returnRate === undefined ? defaultReturnPercentage : returnRate;
      return (investedAmount * (rate / 100)).toFixed(2);
    },
    [defaultReturnPercentage]
  );

  useEffect(() => {
    const fetchDefaultReturnPercentage = async () => {
      try {
        const percentage = await settingsService.getDefaultReturnPercentage();
        setDefaultReturnPercentage(percentage);
        if (!investorToEdit) {
          setFormData((prev) => ({
            ...prev,
            return_percentage: percentage.toFixed(2),
            monthly_payout: calculateMonthlyPayout(prev.invested_amount, percentage),
          }));
        }
      } catch (error) {
        console.error("Failed to fetch default return percentage:", error);
      }
    };
    fetchDefaultReturnPercentage();
  }, [investorToEdit, calculateMonthlyPayout]); // Added investorToEdit here as it determines if we apply default

  useEffect(() => {
    if (investorToEdit) {
      setFormData({
        name: investorToEdit.name,
        email: investorToEdit.email,
        phone_number: investorToEdit.phone_number,
        invested_amount: investorToEdit.invested_amount.toString(),
        investment_date: investorToEdit.investment_date,
        investment_type: investorToEdit.investment_type,
        return_percentage: investorToEdit.return_percentage.toFixed(2),
        monthly_payout: investorToEdit.monthly_payout.toFixed(2),
        upi_transaction_id: investorToEdit.upi_transaction_id,
        total_paid_out: investorToEdit.total_paid_out.toString(),
        notes: investorToEdit.notes || "",
        status: investorToEdit.status,
      });
    } else {
      // Reset form for new investor, ensuring default return percentage is applied
      setFormData({ 
        ...initialFormData, 
        return_percentage: defaultReturnPercentage.toFixed(2),
        monthly_payout: calculateMonthlyPayout("", defaultReturnPercentage), 
      });
    }
  }, [investorToEdit, defaultReturnPercentage, calculateMonthlyPayout]);


  const handleInvestedAmountChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      invested_amount: value,
      monthly_payout: calculateMonthlyPayout(value, parseFloat(prev.return_percentage)),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const investmentData = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        invested_amount: parseFloat(formData.invested_amount),
        investment_date: formData.investment_date,
        investment_type: formData.investment_type,
        return_percentage: parseFloat(formData.return_percentage),
        monthly_payout: parseFloat(formData.monthly_payout),
        upi_transaction_id: formData.upi_transaction_id,
        total_paid_out: parseFloat(formData.total_paid_out),
        notes: formData.notes,
        status: formData.status,
      };

      if (investorToEdit) {
        await investmentService.updateInvestment(investorToEdit.id, investmentData);
        toast({
          title: "Success",
          description: "Investor updated successfully.",
        });
        onInvestorUpdated?.();
      } else {
        await investmentService.addInvestment(investmentData);
        toast({
          title: "Success",
          description: "Investor added successfully.",
        });
        onInvestorAdded();
      }
      onOpenChange(false); // Close dialog on success
    } catch (err) {
      const error = err as Error;
      console.error("Failed to save investor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save investor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use the isOpen prop to control the dialog's open state
  // and onOpenChange to communicate changes back to the parent.
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{investorToEdit ? "Edit Investor" : "Add New Investor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-muted-foreground">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-muted-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-muted-foreground">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground">Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invested_amount" className="text-muted-foreground">Invested Amount *</Label>
                  <Input
                    id="invested_amount"
                    type="number"
                    step="0.01"
                    value={formData.invested_amount}
                    onChange={(e) => handleInvestedAmountChange(e.target.value)}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="investment_date" className="text-muted-foreground">Investment Date *</Label>
                  <Input
                    id="investment_date"
                    type="date"
                    value={formData.investment_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, investment_date: e.target.value }))}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="investment_type" className="text-muted-foreground">Investment Type *</Label>
                  <Select
                    value={formData.investment_type}
                    onValueChange={(value: "Daily" | "Monthly" | "One-time") =>
                      setFormData((prev) => ({ ...prev, investment_type: value }))
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="Daily" className="hover:bg-accent">Daily</SelectItem>
                      <SelectItem value="Monthly" className="hover:bg-accent">Monthly</SelectItem>
                      <SelectItem value="One-time" className="hover:bg-accent">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="return_percentage" className="text-muted-foreground">Return Percentage (%)</Label>
                  <Input
                    id="return_percentage"
                    value={formData.return_percentage}
                    disabled
                    className="bg-muted border-border text-muted-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_payout" className="text-muted-foreground">Monthly Payout</Label>
                  <Input
                    id="monthly_payout"
                    value={formData.monthly_payout}
                    disabled
                    className="bg-muted border-border text-muted-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="upi_transaction_id" className="text-muted-foreground">UPI Transaction ID *</Label>
                  <Input
                    id="upi_transaction_id"
                    value={formData.upi_transaction_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, upi_transaction_id: e.target.value }))}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="total_paid_out" className="text-muted-foreground">Total Paid Out</Label>
                  <Input
                    id="total_paid_out"
                    type="number"
                    step="0.01"
                    value={formData.total_paid_out}
                    onChange={(e) => setFormData((prev) => ({ ...prev, total_paid_out: e.target.value }))}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status" className="text-muted-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Active" | "Inactive") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="Active" className="hover:bg-accent">Active</SelectItem>
                    <SelectItem value="Inactive" className="hover:bg-accent">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes" className="text-muted-foreground">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? "Saving..." : investorToEdit ? "Update Investor" : "Add Investor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
