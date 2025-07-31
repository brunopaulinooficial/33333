import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LogIn, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/Captura de tela 2025-07-31 084022_1753973255735.png";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      // The app will automatically redirect based on authentication state
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="mobile-container bg-app-background">
      <div className="min-h-screen p-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-app-text">Entrar</h1>
          <div className="w-9"></div>
        </div>

        <div className="text-center mb-8">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <img 
              src={logoImage} 
              alt="Equipe Sentinela Drivers Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-app-text mb-2">Bem-vindo de volta!</h2>
          <p className="text-app-secondary">
            Entre na sua conta para continuar o desafio
          </p>
        </div>

        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-app-text">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="seu@email.com"
                          className="px-4 py-3 bg-app-background rounded-xl border border-gray-200 focus:border-app-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-app-text">
                        Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            className="px-4 py-3 bg-app-background rounded-xl border border-gray-200 focus:border-app-primary pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-app-secondary hover:text-app-text"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-app-success hover:bg-app-success/90 text-white py-4 text-lg font-semibold rounded-xl card-shadow"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-app-secondary">
                Não tem uma conta?{" "}
                <Link href="/register">
                  <span className="text-app-primary font-medium hover:underline">
                    Criar conta
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}