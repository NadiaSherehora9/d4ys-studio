
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { PricingPlan } from "@/lib/types";
import { Check, Loader2 } from "lucide-react";

const defaultPricingPlans: PricingPlan[] = [
  {
    id: "trial",
    name: "ПРОБНЕ",
    price: 150,
    period: "грн",
    description: "Перше заняття для новачків",
    features: [
      "1 пробне заняття",
      "Вибір будь-якого напрямку",
      "Знайомство з тренером",
      "Оцінка рівня",
    ],
    active: true,
  },
  {
    id: "single",
    name: "РАЗОВЕ",
    price: 200,
    period: "грн",
    description: "Одне заняття без абонементу",
    features: [
      "1 заняття 60 хв",
      "Будь-який напрямок",
      "Гнучкий графік",
      "Без зобов'язань",
    ],
    active: true,
  },
  {
    id: "monthly",
    name: "АБОНЕМЕНТ",
    price: 1200,
    period: "грн/міс",
    description: "8 занять на місяць",
    features: [
      "8 занять на місяць",
      "Заморозка до 7 днів",
      "Знижка 25%",
      "Пріоритетний запис",
      "Доступ до всіх напрямків",
    ],
    active: true,
  },
  {
    id: "unlimited",
    name: "БЕЗЛІМ",
    price: 2000,
    period: "грн/міс",
    description: "Необмежені заняття",
    features: [
      "Безлімітні заняття",
      "Всі напрямки включено",
      "Персональні поради",
      "Заморозка до 14 днів",
      "VIP підтримка",
      "Ексклюзивні майстер-класи",
    ],
    active: true,
  },
];

const pricingFeaturesDelimiter = "\n---\n";

const parseDescriptionWithFeatures = (raw: string | null, fallback: string[]): { description: string; features: string[] } => {
  if (!raw) {
    return {
      description: "",
      features: fallback,
    };
  }

  const parts = raw.split(pricingFeaturesDelimiter);
  if (parts.length === 1) {
    return {
      description: raw,
      features: fallback,
    };
  }

  const features = parts[1]
    .split("\n")
    .map(line => line.replace(/\s+$/g, ""));

  return {
    description: parts[0],
    features: features.length > 0 ? features : fallback,
  };
};

const buildDescriptionWithFeatures = (description: string, features: string[]): string => {
  const trimmedDescription = description.trim();
  const cleanedFeatures = features.map(f => f.replace(/\s+$/g, ""));
  if (cleanedFeatures.every(f => f.length === 0)) {
    return trimmedDescription;
  }
  return `${trimmedDescription}${pricingFeaturesDelimiter}${cleanedFeatures.join("\n")}`;
};

export function AdminPricing() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(defaultPricingPlans);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("pricing_plans")
      .select("id, name, price, period, description, active");

    if (error || !data) {
      setPricingPlans(defaultPricingPlans);
      setIsLoading(false);
      return;
    }

    const defaultsById = Object.fromEntries(defaultPricingPlans.map(p => [p.id, p]));

    setPricingPlans(
      data.map(row => {
        const base = defaultsById[row.id] ?? null;
        const parsed = parseDescriptionWithFeatures(row.description, base?.features ?? []);

        return {
          id: row.id,
          name: row.name,
          price: row.price,
          period: row.period,
          description: parsed.description,
          features: parsed.features,
          active: (row as { active?: boolean }).active ?? base?.active ?? true,
        };
      }),
    );
    setIsLoading(false);
  };

  const handleChangePricingPrice = (id: string, value: string) => {
    const price = Number(value.replace(/[^\d.]/g, ""));
    setPricingPlans(prev =>
      prev.map(plan => (plan.id === id ? { ...plan, price: Number.isNaN(price) ? 0 : price } : plan)),
    );
  };

  const handleChangePricingDescription = (id: string, value: string) => {
    setPricingPlans(prev => prev.map(plan => (plan.id === id ? { ...plan, description: value } : plan)));
  };

  const handleChangePricingFeatures = (id: string, value: string) => {
    const lines = value.split("\n").map(line => line.replace(/\s+$/g, ""));
    setPricingPlans(prev =>
      prev.map(plan => (plan.id === id ? { ...plan, features: lines } : plan)),
    );
  };

  const handleTogglePricingActive = (id: string, active: boolean) => {
    setPricingPlans(prev => prev.map(plan => (plan.id === id ? { ...plan, active } : plan)));
  };

  const handlePricingSave = async () => {
    setIsSavingPricing(true);

    try {
      if (!supabase) {
        toast.success("Ціни оновлено (локально для цієї сесії)");
        return;
      }

      const payload = pricingPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        period: plan.period,
        description: buildDescriptionWithFeatures(plan.description, plan.features),
        active: plan.active,
      }));

      const { error } = await supabase.from("pricing_plans").upsert(payload, { onConflict: "id" });

      if (error) {
        throw error;
      }

      toast.success("Ціни абонементів збережено");
    } catch (error) {
      console.error("Failed to save pricing plans", error);
      toast.error("Не вдалося зберегти ціни. Перевірте налаштування бази даних.");
    } finally {
      setIsSavingPricing(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Тарифи та Абонементи</h2>
          <p className="text-muted-foreground">Налаштування цін та описів тарифів</p>
        </div>
        <Button onClick={() => void handlePricingSave()} disabled={isSavingPricing} className="gap-2">
          {isSavingPricing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Зберегти зміни
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricingPlans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden border-white/5 bg-white/5">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">{plan.name}</CardTitle>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">ID: {plan.id}</p>
                </div>
                <Switch
                  checked={plan.active}
                  onCheckedChange={(checked) => handleTogglePricingActive(plan.id, checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Ціна</label>
                  <div className="relative">
                    <Input
                      value={plan.price}
                      onChange={(e) => handleChangePricingPrice(plan.id, e.target.value)}
                      className="font-mono text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  </div>
                </div>
                <div className="w-1/2 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Період (інфо)</label>
                  <Input value={plan.period} disabled className="opacity-50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Короткий опис</label>
                <Input
                  value={plan.description}
                  onChange={(e) => handleChangePricingDescription(plan.id, e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Опції (по одній в рядок)</label>
                <Textarea
                  value={plan.features.join("\n")}
                  onChange={(e) => handleChangePricingFeatures(plan.id, e.target.value)}
                  rows={5}
                  className="font-mono text-sm leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
