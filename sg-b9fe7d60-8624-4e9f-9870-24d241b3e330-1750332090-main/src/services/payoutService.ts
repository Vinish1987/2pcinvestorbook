import { supabase } from "@/integrations/supabase/client";

export interface Payout {
  id: string;
  user_investment_id: string;
  month_year: string;
  payout_amount: number;
  status: "Paid" | "Not Paid";
  date_paid?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PayoutWithInvestor extends Payout {
  user_investment: {
    name: string;
    email: string;
    phone_number: string;
    invested_amount: number;
  };
}

export interface PayoutSummary {
  totalRequired: number;
  totalPaid: number;
  pendingPayouts: number;
  paidCount: number;
  unpaidCount: number;
}

export const payoutService = {
  async getPayoutsForMonth(monthYear: string): Promise<PayoutWithInvestor[]> {
    const { data, error } = await supabase
      .from("payouts")
      .select(`
        *,
        user_investment:user_investments(name, email, phone_number, invested_amount)
      `)
      .eq("month_year", monthYear)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async generatePayoutsForMonth(monthYear: string): Promise<void> {
    // Get all active investments
    const { data: investments, error: investmentsError } = await supabase
      .from("user_investments")
      .select("id, monthly_payout")
      .eq("status", "Active");

    if (investmentsError) throw investmentsError;

    if (!investments || investments.length === 0) return;

    // Create payouts for each investment if they don't exist
    const payoutsToInsert = investments.map(investment => ({
      user_investment_id: investment.id,
      month_year: monthYear,
      payout_amount: investment.monthly_payout,
      status: "Not Paid" as const,
    }));

    const { error: insertError } = await supabase
      .from("payouts")
      .upsert(payoutsToInsert, { 
        onConflict: "user_investment_id,month_year",
        ignoreDuplicates: true 
      });

    if (insertError) throw insertError;
  },

  async updatePayoutStatus(
    payoutId: string, 
    status: "Paid" | "Not Paid", 
    datePaid?: string | null,
    notes?: string
  ): Promise<Payout> {
    const updateData: Partial<Payout> = { // Changed 'any' to 'Partial<Payout>'
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "Paid") {
      updateData.date_paid = datePaid || new Date().toISOString().split('T')[0];
    } else {
      updateData.date_paid = null;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from("payouts")
      .update(updateData)
      .eq("id", payoutId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPayoutSummary(monthYear: string): Promise<PayoutSummary> {
    const { data: payouts, error } = await supabase
      .from("payouts")
      .select("payout_amount, status")
      .eq("month_year", monthYear);

    if (error) throw error;

    const summary = payouts?.reduce(
      (acc, payout) => {
        acc.totalRequired += Number(payout.payout_amount);
        if (payout.status === "Paid") {
          acc.totalPaid += Number(payout.payout_amount);
          acc.paidCount++;
        } else {
          acc.unpaidCount++;
        }
        return acc;
      },
      {
        totalRequired: 0,
        totalPaid: 0,
        pendingPayouts: 0,
        paidCount: 0,
        unpaidCount: 0,
      }
    ) || {
      totalRequired: 0,
      totalPaid: 0,
      pendingPayouts: 0,
      paidCount: 0,
      unpaidCount: 0,
    };

    summary.pendingPayouts = summary.totalRequired - summary.totalPaid;
    return summary;
  },

  async exportPayoutsToCSV(monthYear: string): Promise<string> {
    const payouts = await this.getPayoutsForMonth(monthYear);
    
    const headers = [
      "User Name",
      "Email", 
      "Phone",
      "Invested Amount",
      "Monthly Payout",
      "Paid Month",
      "Status",
      "Date Paid",
      "Notes"
    ];

    const csvContent = [
      headers.join(","),
      ...payouts.map(payout => [
        `"${payout.user_investment.name}"`,
        `"${payout.user_investment.email}"`,
        `"${payout.user_investment.phone_number}"`,
        payout.user_investment.invested_amount,
        payout.payout_amount,
        `"${monthYear}"`,
        `"${payout.status}"`,
        payout.date_paid ? `"${payout.date_paid}"` : '""',
        payout.notes ? `"${payout.notes}"` : '""'
      ].join(","))
    ].join("\n");

    return csvContent;
  },

  getCurrentMonthYear(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  formatMonthYear(monthYear: string): string {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  },

  generateMonthOptions(): Array<{ value: string; label: string }> {
    const options = [];
    const currentDate = new Date();
    
    // Generate last 12 months and next 3 months
    for (let i = -12; i <= 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value: monthYear, label });
    }
    
    return options.reverse();
  }
};

export default payoutService;
