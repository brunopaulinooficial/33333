import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dashboard } from "@/components/dashboard";
import { DailyRegister } from "@/components/daily-register";
import { Ranking } from "@/components/ranking";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { logout } from "@/lib/authUtils";

type ActiveTab = "dashboard" | "register" | "ranking" | "settings";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "register":
        return <DailyRegister />;
      case "ranking":
        return <Ranking />;
      case "settings":
        return (
          <div className="p-6">
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h2 className="text-xl font-semibold text-app-text mb-6">Configurações</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="font-medium text-app-text">Nome de exibição</span>
                  <span className="text-app-secondary">{(user as any)?.displayName}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="font-medium text-app-text">Email</span>
                  <span className="text-app-secondary">{(user as any)?.email}</span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full mt-6"
                >
                  Sair da Conta
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="bg-white ios-shadow p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-app-text">Sentinela Drivers</h1>
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-app-secondary" />
            <div className="w-8 h-8 rounded-full bg-app-primary flex items-center justify-center">
              {(user as any)?.profileImageUrl ? (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
