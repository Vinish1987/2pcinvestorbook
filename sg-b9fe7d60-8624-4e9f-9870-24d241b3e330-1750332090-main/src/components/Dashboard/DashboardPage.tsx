import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AddInvestorDialog from "./AddInvestorDialog"; // Removed AddInvestorDialogProps import as it's not directly used
import { investmentService } from "@/services/investmentService";
import {
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  ArrowUpRight,
  Activity,
  PieChart
} from "lucide-react";

interface DashboardStats {
  totalInvestors: number;
  totalInvestment: number;
  totalPayouts: number;
  activeInvestments: number;
}

export default function DashboardPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestors: 0,
    totalInvestment: 0,
    totalPayouts: 0,
    activeInvestments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const investors = await investmentService.getAllInvestments();
      
      const totalInvestors = investors.length;
      const totalInvestment = investors.reduce((sum, investor) => sum + investor.invested_amount, 0);
      const activeInvestments = investors.filter(investor => investor.status === "Active").length;
      
      setStats({
        totalInvestors,
        totalInvestment,
        totalPayouts: 0, // Assuming this will be calculated later
        activeInvestments
      });
    } catch (error) {
      console.error("Error loading dashboard ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestor = () => {
    setShowAddDialog(true);
  };

  const handleViewAllInvestors = () => {
    window.location.href = "/investors";
  };

  const statCards = [
    {
      title: "Total Investors",
      value: stats.totalInvestors,
      icon: Users,
      bgColor: "bg-muted", // Reverted
      textColor: "text-foreground", // Reverted
      change: "+12%", // Example change
      changeType: "positive" // Example change type
    },
    {
      title: "Total Investment",
      value: `₹${stats.totalInvestment.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-muted", // Reverted
      textColor: "text-foreground", // Reverted
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Active Investments",
      value: stats.activeInvestments,
      icon: Activity,
      bgColor: "bg-muted", // Reverted
      textColor: "text-foreground", // Reverted
      change: "+5%",
      changeType: "positive"
    },
    {
      title: "Monthly Returns",
      value: `₹${Math.round(stats.totalInvestment * 0.02).toLocaleString()}`, // Assuming 2% return
      icon: TrendingUp,
      bgColor: "bg-muted", // Reverted
      textColor: "text-foreground", // Reverted
      change: "+15%",
      changeType: "positive"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6"> {/* Reverted background */}
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div> {/* Reverted pulse color */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div> // Reverted pulse color
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-foreground"> {/* Reverted background and text color */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1> {/* Reverted text color */}
              <p className="text-muted-foreground text-lg">Welcome to your investment management dashboard</p> {/* Reverted text color */}
            </div>
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-border px-4 py-2"> {/* Reverted badge colors */}
              <Activity className="w-4 h-4 mr-2" />
              System Active
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleAddInvestor}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200" // Reverted button colors
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Investor
            </Button>
            <Button
              variant="outline"
              onClick={handleViewAllInvestors}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200" // Reverted button colors
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Investors
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <Separator className="bg-border" /> {/* Reverted separator color */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-card border-border card-hover"> {/* Reverted card colors */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${stat.changeType === 'positive' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`} // Kept positive/negative coloring for change
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p> {/* Reverted text color */}
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p> {/* Reverted text color */}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border"> {/* Reverted card colors */}
            <CardHeader>
              <CardTitle className="text-foreground flex items-center"> {/* Reverted text color */}
                <PieChart className="w-5 h-5 mr-2 text-primary" /> {/* Reverted icon color */}
                Quick Actions
              </CardTitle>
              <CardDescription className="text-muted-foreground"> {/* Reverted text color */}
                Manage your investment portfolio efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200" // Reverted button colors
                onClick={() => window.location.href = "/investors"}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Investors
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200" // Reverted button colors
                onClick={() => window.location.href = "/payouts"}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Track Payouts
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200" // Reverted button colors
                onClick={() => window.location.href = "/settings"}
              >
                <Activity className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border"> {/* Reverted card colors */}
            <CardHeader>
              <CardTitle className="text-foreground flex items-center"> {/* Reverted text color */}
                <Activity className="w-5 h-5 mr-2 text-primary" /> {/* Reverted icon color */}
                Recent Activity
              </CardTitle>
              <CardDescription className="text-muted-foreground"> {/* Reverted text color */}
                Latest updates and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"> {/* Reverted background color */}
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div> {/* Kept green for positive indication */}
                  <div className="flex-1">
                    <p className="text-sm text-foreground">System initialized successfully</p> {/* Reverted text color */}
                    <p className="text-xs text-muted-foreground">Just now</p> {/* Reverted text color */}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"> {/* Reverted background color */}
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div> {/* Kept blue for info indication */}
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Dashboard loaded</p> {/* Reverted text color */}
                    <p className="text-xs text-muted-foreground">2 minutes ago</p> {/* Reverted text color */}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"> {/* Reverted background color */}
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div> {/* Kept purple for other indication */}
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Ready for new investors</p> {/* Reverted text color */}
                    <p className="text-xs text-muted-foreground">5 minutes ago</p> {/* Reverted text color */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddInvestorDialog
        isOpen={showAddDialog}
        onOpenChange={setShowAddDialog}
        onInvestorAdded={loadDashboardData}
      />
    </div>
  );
}
