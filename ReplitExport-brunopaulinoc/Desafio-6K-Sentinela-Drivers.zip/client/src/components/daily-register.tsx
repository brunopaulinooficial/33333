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
import { Plus, Car, DollarSign, Check } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const dailyEntrySchema = z.object({
  rides: z.coerce.number().min(1, "Número de corridas deve ser pelo menos 1"),
  revenue: z.coerce.number().min(0.01, "Valor faturado deve ser positivo"),
  fuelCost: z.coerce.number().min(0, "Gasto com combustível não pode ser negativo"),
});

type DailyEntryForm = z.infer<typeof dailyEntrySchema>;

export function DailyRegister() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const form = useForm<DailyEntryForm>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      rides: "" as any,
      revenue: "" as any,
      fuelCost: "" as any,
    },
  });

  const dailyEntryMutation = useMutation({
    mutationFn: async (data: DailyEntryForm) => {
      const response = await apiRequest("POST", "/api/daily-entries", {
        ...data,
        date: currentDate,
      });
      return response.json();
    },
    onSuccess: () => {
      const currentMonth = currentDate.slice(0, 7);
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-stats", currentMonth] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-entries"] });
      
      setShowSuccess(true);
      form.reset();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      toast({
        title: "Registro salvo!",
        description: "Seu dia foi registrado com sucesso!",
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
        description: "Falha ao salvar registro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DailyEntryForm) => {
    dailyEntryMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (showSuccess) {
    return (
      <div className="p-4">
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <div className="text-center success-animation">
              <div className="w-16 h-16 bg-app-success rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-app-success mb-2">
                Registro salvo com sucesso!
              </h2>
              <p className="text-app-secondary">
                Continue assim, você está no caminho certo!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="border-0 card-shadow">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-app-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-app-primary" />
            </div>
            <h2 className="text-xl font-bold text-app-text mb-2">Registro Diário</h2>
            <p className="text-app-secondary text-sm">
              {formatDate(currentDate)}
            </p>
            <p className="text-app-secondary text-sm mt-1">
              Como foi seu dia hoje?
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Rides */}
              <FormField
                control={form.control}
                name="rides"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-app-text">
                      Corridas do Dia
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          placeholder="Ex: 12"
                          className="px-4 py-3 bg-app-background rounded-xl border border-gray-200 focus:border-app-primary pr-12"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <div className="absolute right-3 top-3">
                          <Car className="w-5 h-5 text-app-secondary" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Revenue */}
              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-app-text">
                      Valor Faturado (R$)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Ex: 180,00"
                          className="px-4 py-3 bg-app-background rounded-xl border border-gray-200 focus:border-app-primary pr-12"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <div className="absolute right-3 top-3">
                          <DollarSign className="w-5 h-5 text-app-secondary" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fuel Cost */}
              <FormField
                control={form.control}
                name="fuelCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-app-text">
                      Gasto com Combustível (R$)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Ex: 35,00"
                          className="px-4 py-3 bg-app-background rounded-xl border border-gray-200 focus:border-app-primary pr-12"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <div className="absolute right-3 top-3">
                          <Car className="w-5 h-5 text-app-secondary" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={dailyEntryMutation.isPending}
                className="w-full bg-app-primary hover:bg-app-primary/90 text-white py-4 text-lg font-semibold rounded-xl card-shadow"
              >
                {dailyEntryMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Registrar Dia
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
