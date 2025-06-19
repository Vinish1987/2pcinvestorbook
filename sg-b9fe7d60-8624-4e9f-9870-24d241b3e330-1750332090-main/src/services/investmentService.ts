
import { supabase } from "@/integrations/supabase/client";

export interface UserInvestment {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  invested_amount: number;
  investment_date: string;
  investment_type: "Daily" | "Monthly" | "One-time";
  return_percentage: number;
  monthly_payout: number;
  upi_transaction_id: string;
  total_paid_out: number;
  notes?: string;
  status: "Active" | "Inactive";
  created_at: string | null; 
  updated_at: string | null; 
}

export interface Earnings {
  id: string;
  month_year: string;
  total_earnings: number;
  created_at: string | null; 
  updated_at: string | null; 
}

export interface DashboardStats {
  totalUsers: number;
  totalInvestmentReceived: number;
  totalPayoutThisMonth: number;
  totalProfitRetained: number;
}

export interface ChartData {
  month: string;
  totalInvestment: number;
  monthlyEarnings: number;
}

export const investmentService = {
  async getAllInvestments(): Promise<UserInvestment[]> {
    const { data, error } = await supabase
      .from("user_investments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addInvestment(investment: Omit<UserInvestment, "id" | "created_at" | "updated_at">): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from("user_investments")
      .insert([investment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvestment(id: string, updates: Partial<UserInvestment>): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from("user_investments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInvestment(id: string): Promise<void> {
    const { error } = await supabase
      .from("user_investments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const investmentsResponse = await supabase
      .from("user_investments")
      .select("invested_amount, monthly_payout, created_at");

    if (investmentsResponse.error) throw investmentsResponse.error;
    const investments = investmentsResponse.data;

    const currentMonth = new Date().toISOString().slice(0, 7); 
    const earningsResponse = await supabase
      .from("earnings")
      .select("total_earnings")
      .eq("month_year", currentMonth)
      .single();

    if (earningsResponse.error && earningsResponse.error.code !== "PGRST116") throw earningsResponse.error;
    const earnings = earningsResponse.data;

    const totalUsers = investments?.length || 0;
    const totalInvestmentReceived = investments?.reduce((sum, inv) => sum + Number(inv.invested_amount), 0) || 0;
    const totalPayoutThisMonth = investments?.reduce((sum, inv) => sum + Number(inv.monthly_payout), 0) || 0;
    const monthlyEarnings = earnings?.total_earnings || 0;
    const totalProfitRetained = Number(monthlyEarnings) - totalPayoutThisMonth;

    return {
      totalUsers,
      totalInvestmentReceived,
      totalPayoutThisMonth,
      totalProfitRetained,
    };
  },

  async getChartData(): Promise<ChartData[]> {
    const earningsResponse = await supabase
      .from("earnings")
      .select("*")
      .order("month_year", { ascending: false })
      .limit(6);

    if (earningsResponse.error) throw earningsResponse.error;
    const earnings = earningsResponse.data;

    const investmentsResponse = await supabase
      .from("user_investments")
      .select("invested_amount, investment_date");

    if (investmentsResponse.error) throw investmentsResponse.error;
    const investments = investmentsResponse.data;

    const chartData: ChartData[] = [];
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toISOString().slice(0, 7);
      last6Months.push(monthYear);
    }

    last6Months.forEach(monthYear => {
      const monthName = new Date(monthYear + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" });
      
      const monthEarningsData = earnings?.find(e => e.month_year === monthYear);
      
      const totalInvestmentForMonth = investments?.reduce((sum, inv) => {
        const invDate = new Date(inv.investment_date).toISOString().slice(0, 7);
        if (invDate <= monthYear) {
          return sum + Number(inv.invested_amount);
        }
        return sum;
      }, 0) || 0;

      chartData.push({
        month: monthName,
        totalInvestment: totalInvestmentForMonth,
        monthlyEarnings: Number(monthEarningsData?.total_earnings || 0),
      });
    });

    return chartData;
  },

  async exportInvestorsToCSV(): Promise<string> {
    const investments = await this.getAllInvestments();
    
    const sanitizeCsvValue = (value: unknown): string => {
      if (value === null || value === undefined) {
        return "";
      }
      let stringValue = String(value);
      stringValue = stringValue.replace(/"/g, '""');
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        stringValue = `"${stringValue}"`;
      }
      return stringValue;
    };
    
    const headers = [
      "Name", "Email", "Phone Number", "Invested Amount", 
      "Investment Date", "Investment Type", "Return Percentage", 
      "Monthly Payout", "UPI Transaction ID", "Total Paid Out", 
      "Status", "Notes", "Created At", "Updated At"
    ].map(sanitizeCsvValue);

    const csvRows = investments.map(inv => [
      sanitizeCsvValue(inv.name),
      sanitizeCsvValue(inv.email),
      sanitizeCsvValue(inv.phone_number),
      sanitizeCsvValue(inv.invested_amount),
      sanitizeCsvValue(inv.investment_date),
      sanitizeCsvValue(inv.investment_type),
      sanitizeCsvValue(inv.return_percentage),
      sanitizeCsvValue(inv.monthly_payout),
      sanitizeCsvValue(inv.upi_transaction_id),
      sanitizeCsvValue(inv.total_paid_out),
      sanitizeCsvValue(inv.status),
      sanitizeCsvValue(inv.notes),
      sanitizeCsvValue(inv.created_at),
      sanitizeCsvValue(inv.updated_at)
    ].join(","));

    return [headers.join(","), ...csvRows].join("\n");
  }
};

export default investmentService;
