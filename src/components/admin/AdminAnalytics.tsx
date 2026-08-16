
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import * as RechartsPrimitive from "recharts";
import {
  Activity,
  CalendarRange,
  Gauge,
  Globe,
  TrendingDown,
  TrendingUp,
  Users,
  Music2,
  BarChart3,
} from "lucide-react";
import { BookingRow } from "@/lib/types";
import { parseBookingNotes } from "@/lib/utils";
import { bookingStatusLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AdminAnalyticsProps {
  bookings: BookingRow[];
}

const attendanceChartConfig = {
  bookings: {
    label: "Всього",
    color: "hsl(var(--primary))",
  },
  attended: {
    label: "Відвідано",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  pending: { label: bookingStatusLabels.pending, color: "hsl(var(--chart-4))" },
  confirmed: { label: bookingStatusLabels.confirmed, color: "hsl(var(--chart-3))" },
  canceled: { label: bookingStatusLabels.canceled, color: "hsl(var(--chart-1))" },
  attended: { label: bookingStatusLabels.attended, color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const weekdayChartConfig = {
  bookings: { label: "Бронювання", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const getStatusSourceLabel = (b: BookingRow): string => {
  const source = parseBookingNotes(b.notes).source.trim();
  if (source) return source;
  if (b.user_id) return "Особистий кабінет";
  return "Інше";
};

export function AdminAnalytics({ bookings }: AdminAnalyticsProps) {
  // --- Core stats ---
  const attendedBookings = bookings.filter(b => b.status === "attended");
  const attendanceRate = bookings.length > 0 ? Math.round((attendedBookings.length / bookings.length) * 100) : 0;
  const cancelRate = bookings.length > 0
    ? Math.round((bookings.filter(b => b.status === "canceled").length / bookings.length) * 100)
    : 0;

  // --- 30-day window + delta vs previous 30 days ---
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const recentBookings = bookings.filter(b => new Date(b.created_at) >= thirtyDaysAgo);

  const previousWindowBookings = bookings.filter(b => {
    const d = new Date(b.created_at);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  });
  const monthDelta = previousWindowBookings.length > 0
    ? Math.round(((recentBookings.length - previousWindowBookings.length) / previousWindowBookings.length) * 100)
    : null;

  // --- Status distribution (donut) ---
  const statusData = (["pending", "confirmed", "canceled", "attended"] as const)
    .map(status => ({
      status,
      label: bookingStatusLabels[status],
      value: bookings.filter(b => b.status === status).length,
      fill: `var(--color-${status})`,
    }))
    .filter(d => d.value > 0);

  // --- Sources ---
  const sourceData = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      const key = getStatusSourceLabel(b);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Directions ---
  const directionData = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      const key = parseBookingNotes(b.notes).direction.trim() || "Не вказано";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Weekday activity ---
  const weekdayData = weekdayLabels.map((label, i) => {
    const jsDay = (i + 1) % 7; // Monday-first index -> JS getDay()
    return {
      day: label,
      bookings: bookings.filter(b => new Date(b.created_at).getDay() === jsDay).length,
    };
  });
  const busiestDay = weekdayData.reduce((best, d) => (d.bookings > best.bookings ? d : best), weekdayData[0]);

  // Prepare Daily Series (last 30 days)
  const dailySeries = (() => {
    const data: Record<string, { date: string; bookings: number; attended: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      data[key] = { date: key, bookings: 0, attended: 0 };
    }
    recentBookings.forEach(b => {
      const key = new Date(b.created_at).toISOString().slice(0, 10);
      if (data[key]) {
        data[key].bookings += 1;
        if (b.status === "attended") {
          data[key].attended += 1;
        }
      }
    });
    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  })();

  // Prepare Weekly Series (last 8 weeks)
  const weeklySeries = (() => {
    const data: Record<string, { weekLabel: string; bookings: number; attended: number; sortKey: string }> = {};

    bookings.forEach(b => {
      const d = new Date(b.created_at);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      const key = weekStart.toISOString().slice(0, 10);

      if (!data[key]) {
        data[key] = {
          weekLabel: weekStart.toLocaleDateString("uk-UA", { month: "short", day: "numeric" }),
          bookings: 0,
          attended: 0,
          sortKey: key,
        };
      }
      data[key].bookings += 1;
      if (b.status === "attended") {
        data[key].attended += 1;
      }
    });

    return Object.values(data)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-8);
  })();

  if (bookings.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur border-white/10">
        <CardContent className="py-16 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BarChart3 className="w-7 h-7" />
          </div>
          <p className="font-semibold text-lg">Аналітика поки порожня</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Як тільки зʼявляться перші бронювання, тут буде детальна статистика студії.
          </p>
        </CardContent>
      </Card>
    );
  }

  const kpiCards = [
    {
      label: "Всього бронювань",
      value: String(bookings.length),
      icon: CalendarRange,
      iconClass: "text-primary bg-primary/10 border-primary/20",
      sub: `Відвідано ${attendedBookings.length} з ${bookings.length}`,
    },
    {
      label: "Відвідуваність",
      value: `${attendanceRate}%`,
      icon: Gauge,
      iconClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      sub: "Відвідано до всіх бронювань",
      progress: attendanceRate,
      progressClass: "bg-emerald-500",
    },
    {
      label: "Нові за 30 днів",
      value: String(recentBookings.length),
      icon: monthDelta !== null && monthDelta >= 0 ? TrendingUp : TrendingDown,
      iconClass: monthDelta !== null && monthDelta >= 0
        ? "text-blue-500 bg-blue-500/10 border-blue-500/20"
        : "text-amber-500 bg-amber-500/10 border-amber-500/20",
      sub: monthDelta === null
        ? "Немає даних за попередній період"
        : `${monthDelta >= 0 ? "+" : ""}${monthDelta}% до попередніх 30 днів`,
    },
    {
      label: "Скасування",
      value: `${cancelRate}%`,
      icon: Activity,
      iconClass: "text-red-500 bg-red-500/10 border-red-500/20",
      sub: "Відмінені бронювання від усіх",
      progress: cancelRate,
      progressClass: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpiCards.map(card => (
          <Card key={card.label} className="bg-card/60 backdrop-blur border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                  {card.label}
                </p>
                <div className={cn("w-8 h-8 md:w-9 md:h-9 rounded-lg border flex items-center justify-center shrink-0", card.iconClass)}>
                  <card.icon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold mt-2">{card.value}</p>
              {typeof card.progress === "number" && (
                <div className="h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", card.progressClass)}
                    style={{ width: `${Math.min(100, card.progress)}%` }}
                  />
                </div>
              )}
              <p className="text-[11px] md:text-xs text-muted-foreground mt-2">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamics charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card className="bg-card/60 backdrop-blur border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-primary" />
              Динаміка за днями
              <span className="text-xs font-normal text-muted-foreground hidden sm:inline">останні 30 днів</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailySeries.every(d => d.bookings === 0) ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                Поки що немає бронювань за останні 30 днів.
              </p>
            ) : (
              <ChartContainer config={attendanceChartConfig} className="mt-2 min-h-[240px] md:min-h-[300px] w-full">
                <RechartsPrimitive.AreaChart data={dailySeries}>
                  <defs>
                    <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-bookings)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-bookings)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fillAttended" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-attended)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-attended)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <RechartsPrimitive.XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                    tickFormatter={value => {
                      const date = new Date(value);
                      return date.toLocaleDateString("uk-UA", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsPrimitive.Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="var(--color-bookings)"
                    strokeWidth={2}
                    fill="url(#fillBookings)"
                  />
                  <RechartsPrimitive.Area
                    type="monotone"
                    dataKey="attended"
                    stroke="var(--color-attended)"
                    strokeWidth={2}
                    fill="url(#fillAttended)"
                  />
                </RechartsPrimitive.AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              Динаміка за тижнями
              <span className="text-xs font-normal text-muted-foreground hidden sm:inline">останні 8 тижнів</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklySeries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Недостатньо даних для тижневої статистики.</p>
            ) : (
              <ChartContainer config={attendanceChartConfig} className="mt-2 min-h-[240px] md:min-h-[300px] w-full">
                <RechartsPrimitive.BarChart data={weeklySeries}>
                  <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <RechartsPrimitive.XAxis
                    dataKey="weekLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10 }}
                  />
                  <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsPrimitive.Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
                  <RechartsPrimitive.Bar dataKey="attended" fill="var(--color-attended)" radius={[4, 4, 0, 0]} />
                </RechartsPrimitive.BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status donut + breakdowns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-card/60 backdrop-blur border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-primary" />
              Статуси бронювань
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <ChartContainer config={statusChartConfig} className="min-h-[220px] w-full sm:w-1/2 aspect-square">
              <RechartsPrimitive.PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <RechartsPrimitive.Pie data={statusData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {statusData.map(entry => (
                    <RechartsPrimitive.Cell key={entry.status} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
              </RechartsPrimitive.PieChart>
            </ChartContainer>
            <div className="w-full sm:w-1/2 space-y-2">
              {statusData.map(entry => (
                <div key={entry.status} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                    <span className="truncate">{entry.label}</span>
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {entry.value} · {Math.round((entry.value / bookings.length) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4 text-primary" />
              Джерела записів
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceData.map(s => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{s.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {s.value} · {Math.round((s.value / bookings.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-red-700 transition-all"
                    style={{ width: `${(s.value / bookings.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Music2 className="w-4 h-4 text-primary" />
              Популярні напрямки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {directionData.map(d => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate uppercase tracking-wide">{d.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {d.value} · {Math.round((d.value / bookings.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
                    style={{ width: `${(d.value / bookings.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekday activity */}
      <Card className="bg-card/60 backdrop-blur border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="w-4 h-4 text-primary" />
            Активність за днями тижня
            {busiestDay && busiestDay.bookings > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                найбільше записів — {busiestDay.day}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={weekdayChartConfig} className="mt-2 min-h-[220px] w-full">
            <RechartsPrimitive.BarChart data={weekdayData}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <RechartsPrimitive.XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
              <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <RechartsPrimitive.Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
            </RechartsPrimitive.BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
