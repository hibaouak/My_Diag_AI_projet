import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, History, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/mydiagai-logo.png";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Activity, label: "Diagnostic", path: "/diagnostic" },
  { icon: History, label: "Historique", path: "/history" }, 
  { icon: BarChart3, label: "Statistiques", path: "/statistics" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <img src={logo} alt="MyDiagAI Logo" className="h-10 w-10" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            MyDiagAI
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Link>
        </div>
      </div>
    </aside>
  );
};
