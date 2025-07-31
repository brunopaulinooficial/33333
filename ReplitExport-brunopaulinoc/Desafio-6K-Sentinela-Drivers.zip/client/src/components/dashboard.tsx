import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Medal, Star, DollarSign, Car, TrendingUp, Percent, Calendar, Target } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const { data: monthlyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/monthly-stats", currentMonth],
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
  });

  if (statsLoading) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = parseFloat((monthlyStats as any)?.totalRevenue || "0");
  const totalFuelCost = parseFloat((monthlyStats as any)?.totalFuelCost || "0");
  const goalAmount = parseFloat((monthlyStats as any)?.goalAmount || "6000");
  const progressPercentage = Math.min((totalRevenue / goalAmount) * 100, 100);
  const remainingAmount = Math.max(goalAmount - totalRevenue, 0);
  const netProfit = totalRevenue - totalFuelCost;
  const roi = totalFuelCost > 0 ? ((netProfit / totalFuelCost) * 100) : 0;

  const hasAchievement = (type: string) => {
    return (achievements as any)?.some?.((achievement: any) => achievement.type === type);
  };

  return (
    <div className="space-y-4">
      {/* Progress Section */}
      <div className="p-4">
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-app-text mb-2">
                {(user as any)?.displayName || "Motorista"}
              </h2>
              <p className="text-app-secondary text-sm">Meta: R$ {goalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-app-text">Progresso Mensal</span>
                <span className="text-sm font-bold text-app-primary">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-app-secondary">
                <span>R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>R$ {goalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 card-shadow ${
                  hasAchievement('champion') ? 'badge-gold' : 'bg-gray-300'
                }`}>
                  <Crown className={`w-5 h-5 ${hasAchievement('champion') ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <p className="text-xs text-app-secondary">Campeão</p>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 card-shadow ${
                  hasAchievement('veteran') ? 'badge-silver' : 'bg-gray-300'
                }`}>
                  <Medal className={`w-5 h-5 ${hasAchievement('veteran') ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <p className="text-xs text-app-secondary">Veterano</p>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 card-shadow ${
                  hasAchievement('goal_6k') || progressPercentage >= 100 ? 'badge-gold' : 'bg-gray-300'
                }`}>
                  <Star className={`w-5 h-5 ${hasAchievement('goal_6k') || progressPercentage >= 100 ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <p className="text-xs text-app-secondary">Meta 6K</p>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 card-shadow ${
                  hasAchievement('rides_100') ? 'badge-gold' : 'bg-gray-300'
                }`}>
                  <Target className={`w-5 h-5 ${hasAchievement('rides_100') ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <p className="text-xs text-app-secondary">100 Corridas</p>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 card-shadow ${
                  hasAchievement('days_30') ? 'badge-gold' : 'bg-gray-300'
                }`}>
                  <Calendar className={`w-5 h-5 ${hasAchievement('days_30') ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <p className="text-xs text-app-secondary">30 Dias</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-app-background rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-app-primary mb-1">
                  {(monthlyStats as any)?.totalRides || 0}
                </div>
                <div className="text-xs text-app-secondary">Corridas</div>
              </div>
              <div className="bg-app-background rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-app-success mb-1">
                  R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-app-secondary">Restante</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="px-4 pb-6">
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-app-text mb-4">Estatísticas Detalhadas</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-app-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-app-primary" />
                  </div>
                  <span className="font-medium text-app-text">Faturamento Total</span>
                </div>
                <span className="font-bold text-app-text">
                  R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-app-danger/10 rounded-lg flex items-center justify-center">
                    <Car className="w-4 h-4 text-app-danger" />
                  </div>
                  <span className="font-medium text-app-text">Gasto Combustível</span>
                </div>
                <span className="font-bold text-app-danger">
                  R$ {totalFuelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-app-success/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-app-success" />
                  </div>
                  <span className="font-medium text-app-text">Lucro Líquido</span>
                </div>
                <span className="font-bold text-app-success">
                  R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-app-warning/10 rounded-lg flex items-center justify-center">
                    <Percent className="w-4 h-4 text-app-warning" />
                  </div>
                  <span className="font-medium text-app-text">ROI Estimado</span>
                </div>
                <span className="font-bold text-app-warning">
                  {roi.toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
