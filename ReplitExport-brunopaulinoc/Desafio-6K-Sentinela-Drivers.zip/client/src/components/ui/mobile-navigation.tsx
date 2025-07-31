import { Home, Plus, Trophy, Settings } from "lucide-react";
import { Button } from "./button";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: "dashboard" | "register" | "ranking" | "settings") => void;
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const tabs = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "register", icon: Plus, label: "Registro" },
    { id: "ranking", icon: Trophy, label: "Ranking" },
    { id: "settings", icon: Settings, label: "Config" },
  ] as const;

  return (
    <div className="bg-white border-t border-gray-100 px-4 pb-6 pt-2 sticky bottom-0">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                isActive ? "text-app-primary" : "text-app-secondary"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-app-primary" : "text-app-secondary"}`} />
              <span className={`text-xs ${isActive ? "text-app-primary font-medium" : "text-app-secondary"}`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
