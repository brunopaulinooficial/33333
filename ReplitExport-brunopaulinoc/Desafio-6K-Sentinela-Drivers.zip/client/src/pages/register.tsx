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
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/Captura de tela 2025-07-31 084022_1753973255735.png";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  displayName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await apiRequest("POST", "/api/auth/register", {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para o app...",
      });
      
      // Invalidate and refetch auth queries to refresh user state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Use a longer timeout to allow the auth state to update
      setTimeout(() => {
        // Force a full page reload to ensure auth state is refreshed
        window.location.reload();
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Falha ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
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
          <h1 className="text-lg font-semibold text-app-text">Criar Conta</h1>
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
          <h2 className="text-2xl font-bold text-app-text mb-2">Bem-vindo!</h2>
          <p className="text-app-secondary">
            Crie sua conta para participar do Desafio 6K
          </p>
        </div>

        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Display Name */}
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-app-text">
                        Nome de Exibição
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Como você gostaria de ser chamado?"
                          className="px-4 py-3 bg-app-background rounded-xl border border-gray-200 focus:border-app-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            placeholder="Mínimo 6 caracteres"
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

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-app-text">
                        Confirmar Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Digite a senha novamente"
                            className="px-4 py-3 bg-app-background rounded-xl border border-gray-200 focus:border-app-primary pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-app-secondary hover:text-app-text"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  disabled={registerMutation.isPending}
                  className="w-full bg-app-primary hover:bg-app-primary/90 text-white py-4 text-lg font-semibold rounded-xl card-shadow"
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>
            </Form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-app-secondary">
                Já tem uma conta?{" "}
                <Link href="/login">
                  <span className="text-app-primary font-medium hover:underline">
                    Fazer login
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