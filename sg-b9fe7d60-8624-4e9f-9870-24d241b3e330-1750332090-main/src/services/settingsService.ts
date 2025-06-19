
import { supabase } from "@/integrations/supabase/client";

export interface Settings {
  id: string;
  default_return_percentage: number;
  admin_email?: string | null;
  admin_contact_info?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const settingsService = {
  async getSettings(): Promise<Settings | null> {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    // First, try to get existing settings
    const existing = await this.getSettings();
    
    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("settings")
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new settings if none exist
      const { data, error } = await supabase
        .from("settings")
        .insert([{
          default_return_percentage: updates.default_return_percentage || 2.00,
          admin_email: updates.admin_email,
          admin_contact_info: updates.admin_contact_info,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getDefaultReturnPercentage(): Promise<number> {
    const settings = await this.getSettings();
    return settings?.default_return_percentage || 2.00;
  }
};

export default settingsService;
