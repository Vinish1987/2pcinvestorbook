import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Building2
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/",
    },
    {
      icon: Users,
      label: "All Investors",
      path: "/investors",
    },
    {
      icon: TrendingUp,
      label: "Monthly Payout Tracker",
      path: "/payouts",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className={`h-screen bg-card border-r border-border transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'} flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">2PC Investor</h1>
                <p className="text-xs text-muted-foreground">Data Management</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Determine active state based on router.asPath
          const currentCleanPath = router.asPath.split("?")[0].split("#")[0];
          let isActive;
          if (item.path === "/") {
            // Dashboard is active if path is "/", "/dashboard", or empty (root)
            isActive = currentCleanPath === "/" || currentCleanPath === "/dashboard" || currentCleanPath === "";
          } else {
            isActive = currentCleanPath === item.path;
          }
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 transition-all duration-200 ${
                isActive 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              } ${isCollapsed ? 'px-3' : 'px-4'}`}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <Card className="bg-muted/50">
          <div className="p-4">
            {!isCollapsed && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'V'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Vinish Kumar
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || 'vini12345@gmail.com'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
            {isCollapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
