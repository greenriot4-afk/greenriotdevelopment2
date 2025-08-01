import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Gift, Package } from "lucide-react";

const tabs = [
  {
    id: "abandons",
    label: "Abandonados",
    icon: Trash2,
    path: "/abandons"
  },
  {
    id: "donations", 
    label: "Donaciones",
    icon: Gift,
    path: "/donations"
  },
  {
    id: "products",
    label: "Productos", 
    icon: Package,
    path: "/products"
  }
];

export function MobileTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex justify-center border-b bg-background">
      <div className="flex w-full max-w-md">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabClick(tab.path)}
              className={`flex-1 h-14 rounded-none border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}