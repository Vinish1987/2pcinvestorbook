
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, DollarSign, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import settingsService, { Settings as SettingsType } from "@/services/settingsService";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    default_return_percentage: "2.00",
    admin_email: "",
    admin_contact_info: "",
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      if (data) {
        setSettings(data);
        setFormData({
          default_return_percentage: data.default_return_percentage.toString(),
          admin_email: data.admin_email || "",
          admin_contact_info: data.admin_contact_info || "",
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        default_return_percentage: parseFloat(formData.default_return_percentage),
        admin_email: formData.admin_email || null,
        admin_contact_info: formData.admin_contact_info || null,
      };

      await settingsService.updateSettings(updates);
      
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });

      // Reload settings to get the updated data
      await loadSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your application settings and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Configuration */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Configuration
              </CardTitle>
              <p className="text-sm text-gray-600">
                Set default values for investment calculations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default_return_percentage">
                  Default Return Percentage (%)
                </Label>
                <Input
                  id="default_return_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.default_return_percentage}
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      default_return_percentage: e.target.value 
                    }))
                  }
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This percentage will be used to auto-calculate monthly payouts for new investments
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Preview Calculation</h4>
                <p className="text-sm text-blue-700">
                  For ₹1,00,000 investment at {formData.default_return_percentage}% return:
                </p>
                <p className="text-sm font-medium text-blue-800">
                  Monthly Payout = ₹{(100000 * (parseFloat(formData.default_return_percentage) || 0) / 100).toLocaleString('en-IN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Admin Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Contact information for communications and support
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="admin_email">Admin Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      admin_email: e.target.value 
                    }))
                  }
                  placeholder="admin@2pcinvestor.com"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This email will be used for system notifications and investor communications
                </p>
              </div>

              <div>
                <Label htmlFor="admin_contact_info">Contact Information</Label>
                <Textarea
                  id="admin_contact_info"
                  value={formData.admin_contact_info}
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      admin_contact_info: e.target.value 
                    }))
                  }
                  placeholder="Contact us for any queries regarding your investments..."
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This information will be displayed in reports and communications
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Save Changes</h3>
                <p className="text-sm text-gray-600">
                  Click save to apply your configuration changes
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Settings Summary */}
        {settings && (
          <Card className="shadow-sm bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Default Return Rate:</span>
                  <p className="text-gray-900">{settings.default_return_percentage}% per month</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Admin Email:</span>
                  <p className="text-gray-900">{settings.admin_email || "Not set"}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Contact Info:</span>
                  <p className="text-gray-900">{settings.admin_contact_info || "Not set"}</p>
                </div>
                <div className="md:col-span-2 text-xs text-gray-500">
                  Last updated: {settings.updated_at ? new Date(settings.updated_at).toLocaleString('en-IN') : "Never"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
