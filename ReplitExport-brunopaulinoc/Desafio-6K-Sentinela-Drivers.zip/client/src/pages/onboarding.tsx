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
import { UserPlus, Camera, Rocket, Info } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const onboardingSchema = z.object({
  displayName: z.string().min(1, "Nome de exibição é obrigatório"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingForm & { profileImageUrl?: string }) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil configurado!",
        description: "Bem-vindo ao Desafio 6K!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão expirada",
          description: "Redirecionando para login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao configurar perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: OnboardingForm) => {
    onboardingMutation.mutate({
      ...data,
      profileImageUrl: profileImage || undefined,
    });
  };

  return (
    <div className="mobile-container bg-app-background">
      <div className="min-h-screen p-4 pt-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-app-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-12 h-12 text-app-success" />
          </div>
          <h1 className="text-2xl font-bold text-app-text mb-2">Bem-vindo!</h1>
          <p className="text-app-secondary">
            Vamos configurar seu perfil para começar o desafio
          </p>
        </div>

        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Photo */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 w-8 h-8 bg-app-primary text-white rounded-full flex items-center justify-center card-shadow cursor-pointer">
                      <Camera className="w-4 h-4" />
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-app-secondary">Toque para adicionar sua foto</p>
                </div>

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

                {/* Info Box */}
                <div className="bg-app-primary/5 border border-app-primary/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-app-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-3 h-3 text-app-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-app-text mb-1">
                        Sobre o Desafio 6K
                      </p>
                      <p className="text-xs text-app-secondary">
                        Meta mensal de R$ 6.000 em faturamento. Você aparecerá como "Não classificado" até o primeiro registro diário.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={onboardingMutation.isPending}
                  className="w-full bg-app-primary hover:bg-app-primary/90 text-white py-4 text-lg font-semibold rounded-xl card-shadow"
                >
                  {onboardingMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Configurando...</span>
                    </div>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Começar Desafio
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
