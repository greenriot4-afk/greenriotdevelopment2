import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DollarSign, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const tabs = [
  {
    id: "abandons",
    labelKey: "nav.abandons",
    iconSrc: "/lovable-uploads/879e7bbc-f480-4a92-828d-077abd67eb7e.png",
    path: "/app/abandons"
  },
  {
    id: "donations", 
    labelKey: "nav.donations",
    iconSrc: "/lovable-uploads/1c4d7d84-8efb-46de-9f25-d9f67e6b3572.png",
    path: "/app/donations"
  },
  {
    id: "products",
    labelKey: "nav.products", 
    iconSrc: "/lovable-uploads/6245700a-9f69-4791-b47e-aa1bd715be37.png",
    path: "/app/products"
  },
  {
    id: "markets",
    labelKey: "nav.markets",
    iconSrc: "/lovable-uploads/db565d88-e9c2-492d-bf27-7c312a6cd298.png",
    path: "/app/markets"
  },
  {
    id: "affiliates",
    labelKey: "nav.affiliates",
    icon: DollarSign,
    path: "/app/affiliates"
  }
];

export function MobileTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentPath = location.pathname;

  const handleTabClick = (path: string) => {
    console.log('MobileTabs: Tab clicked', { currentPath, targetPath: path });
    navigate(path);
  };

  return (
    <div className="flex justify-center border-b bg-background">
      <div className="flex w-full max-w-md">
        {tabs.map((tab) => {
          const isActive = currentPath.startsWith('/app') && currentPath.includes(tab.path.replace('/app', ''));
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabClick(tab.path)}
              className={`flex-1 min-w-[80px] h-14 rounded-none border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {tab.iconSrc ? (
                  <img 
                    src={tab.iconSrc} 
                    alt={t(tab.labelKey)}
                    className={`h-5 w-5 ${isActive ? 'opacity-100' : 'opacity-60'}`}
                  />
                ) : tab.icon ? (
                  <tab.icon 
                    className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                ) : null}
                <span className="text-xs font-medium">{t(tab.labelKey)}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}