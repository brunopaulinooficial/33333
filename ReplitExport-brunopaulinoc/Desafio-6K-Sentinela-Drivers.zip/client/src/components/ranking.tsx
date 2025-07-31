import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Crown, Medal, Award } from "lucide-react";

export function Ranking() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const { data: rankingData, isLoading } = useQuery({
    queryKey: ["/api/ranking", currentMonth],
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="flex justify-center space-x-4 mt-8">
              <div className="w-16 h-20 bg-gray-200 rounded"></div>
              <div className="w-20 h-24 bg-gray-200 rounded"></div>
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ranking = (rankingData as any) || [];
  const [first, second, third, ...others] = ranking;

  const getRankingColor = (revenue: number, goalAmount = 6000) => {
    const percentage = (revenue / goalAmount) * 100;
    if (percentage >= 100) return "app-success";
    if (percentage >= 50) return "app-warning";
    return "app-danger";
  };

  const getRankingStatus = (revenue: number, goalAmount = 6000) => {
    const percentage = (revenue / goalAmount) * 100;
    if (percentage >= 100) return "Meta batida!";
    if (percentage >= 50) return "Acima de 50%";
    if (percentage > 0) return "Abaixo de 50%";
    return "Não classificado";
  };

  const formatCurrency = (value: string) => {
    return parseFloat(value).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getPercentage = (revenue: string, goalAmount = 6000) => {
    const percentage = (parseFloat(revenue) / goalAmount) * 100;
    return Math.round(percentage);
  };

  const getInitials = (user: any) => {
    if (user.displayName) {
      return user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4">
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-app-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-app-warning" />
              </div>
              <h2 className="text-xl font-bold text-app-text mb-2">Ranking Mensal</h2>
              <p className="text-app-secondary text-sm">
                Desafio 6K - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Top 3 Podium */}
            {ranking?.length > 0 && (
              <div className="flex justify-center items-end space-x-4 mb-8">
                {/* 2nd Place */}
                {second && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-gray-600">
                        {getInitials(second.user)}
                      </span>
                    </div>
                    <div className="bg-gray-200 w-20 h-16 rounded-t-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">2</span>
                    </div>
                    <p className="text-xs font-medium text-app-text mt-2">
                      {second.user.displayName || second.user.firstName || 'Motorista'}
                    </p>
                    <p className="text-xs text-app-success font-bold">
                      {formatCurrency(second.totalRevenue)}
                    </p>
                  </div>
                )}

                {/* 1st Place */}
                {first && (
                  <div className="text-center">
                    <div className="w-20 h-20 badge-gold rounded-full flex items-center justify-center mb-2 card-shadow">
                      <span className="text-xl font-bold text-white">
                        {getInitials(first.user)}
                      </span>
                    </div>
                    <div className="badge-gold w-24 h-20 rounded-t-lg flex items-center justify-center card-shadow">
                      <span className="text-xl font-bold text-white">1</span>
                    </div>
                    <p className="text-sm font-bold text-app-text mt-2">
                      {first.user.displayName || first.user.firstName || 'Motorista'}
                    </p>
                    <p className="text-sm text-app-success font-bold">
                      {formatCurrency(first.totalRevenue)}
                    </p>
                  </div>
                )}

                {/* 3rd Place */}
                {third && (
                  <div className="text-center">
                    <div className="w-16 h-16 badge-bronze rounded-full flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-white">
                        {getInitials(third.user)}
                      </span>
                    </div>
                    <div className="badge-bronze w-20 h-12 rounded-t-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <p className="text-xs font-medium text-app-text mt-2">
                      {third.user.displayName || third.user.firstName || 'Motorista'}
                    </p>
                    <p className="text-xs text-app-warning font-bold">
                      {formatCurrency(third.totalRevenue)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Ranking List */}
      <div className="px-4 pb-6">
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-app-text mb-4">Classificação Completa</h3>
            
            <div className="space-y-3">
              {ranking?.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-app-secondary">Nenhum registro encontrado para este mês.</p>
                </div>
              ) : (
                ranking?.map?.((entry: any, index: number) => {
                  const revenue = parseFloat(entry.totalRevenue);
                  const percentage = getPercentage(entry.totalRevenue);
                  const color = getRankingColor(revenue);
                  const status = getRankingStatus(revenue);
                  const position = index + 1;

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 border rounded-xl ${
                        color === "app-success" 
                          ? "bg-app-success/5 border-app-success/20" 
                          : color === "app-warning"
                          ? "bg-app-warning/5 border-app-warning/20"
                          : revenue > 0
                          ? "bg-app-danger/5 border-app-danger/20"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          color === "app-success" 
                            ? "bg-app-success" 
                            : color === "app-warning"
                            ? "bg-app-warning"
                            : revenue > 0
                            ? "bg-app-danger"
                            : "bg-gray-400"
                        }`}>
                          {revenue > 0 ? position : "-"}
                        </div>
                        <div>
                          <p className="font-semibold text-app-text">
                            {entry.user.displayName || entry.user.firstName || 'Motorista'}
                          </p>
                          <p className="text-xs text-app-secondary">{status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          color === "app-success" 
                            ? "text-app-success" 
                            : color === "app-warning"
                            ? "text-app-warning"
                            : revenue > 0
                            ? "text-app-danger"
                            : "text-gray-400"
                        }`}>
                          {formatCurrency(entry.totalRevenue)}
                        </p>
                        <p className={`text-xs ${
                          color === "app-success" 
                            ? "text-app-success" 
                            : color === "app-warning"
                            ? "text-app-warning"
                            : revenue > 0
                            ? "text-app-danger"
                            : "text-gray-400"
                        }`}>
                          {revenue > 0 ? `${percentage}%` : "-"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
