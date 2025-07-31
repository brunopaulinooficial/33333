import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/Captura de tela 2025-07-31 084022_1753973255735.png";

export default function Landing() {

  return (
    <div className="mobile-container bg-app-background">
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 px-6 pt-16 pb-8">
          <div className="text-center mb-12">
            <div className="w-32 h-32 flex items-center justify-center mx-auto mb-6">
              <img 
                src={logoImage} 
                alt="Equipe Sentinela Drivers Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-app-text mb-4">
              Sentinela Drivers
            </h1>
            <p className="text-app-secondary text-lg mb-2">
              Desafio 6K
            </p>
            <p className="text-app-secondary">
              Entre e conquiste sua meta mensal!
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-12">
            <Card className="border-0 card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-app-success/10 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-app-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-app-text">Ranking em Tempo Real</h3>
                    <p className="text-sm text-app-secondary">
                      Acompanhe sua posição e compete com outros motoristas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-app-warning/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-app-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-app-text">Controle de Metas</h3>
                    <p className="text-sm text-app-secondary">
                      Registre seus ganhos diários e acompanhe o progresso
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-app-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-app-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-app-text">Equipe Motivada</h3>
                    <p className="text-sm text-app-secondary">
                      Conquiste medalhas e celebre suas vitórias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-app-primary hover:bg-app-primary/90 text-white py-4 text-lg font-semibold rounded-xl card-shadow">
                Entrar no Desafio
              </Button>
            </Link>
            
            <Link href="/register">
              <Button variant="outline" className="w-full py-4 text-lg font-semibold rounded-xl border-2 border-app-primary text-app-primary hover:bg-app-primary hover:text-white">
                Criar Conta
              </Button>
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-app-secondary">
                Meta mensal: <span className="font-semibold text-app-success">R$ 6.000,00</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8">
          <div className="text-center">
            <p className="text-xs text-app-secondary">
              Equipe Sentinela Drivers - Desafio 6K
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
