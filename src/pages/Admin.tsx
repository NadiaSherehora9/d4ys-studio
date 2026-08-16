import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Users,
  BarChart3,
  Settings2,
  LogOut,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { AdminPricing } from "@/components/admin/AdminPricing";
import { AdminSchedule } from "@/components/admin/AdminSchedule";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { BookingRow, BookingStatus } from "@/lib/types";
import logo from "@/assets/logo.png";

const Admin = () => {
  const { session, signIn, signOut, isLoading: authLoading, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Stats for the top cards
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    canceled: bookings.filter(b => b.status === "canceled").length,
    attended: bookings.filter(b => b.status === "attended").length,
    pending: bookings.filter(b => b.status === "pending").length,
  };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newThisWeek = bookings.filter(b => new Date(b.created_at) >= weekAgo).length;

  useEffect(() => {
    if (session) {
      void loadBookings();

      if (!supabase) return;

      const bookingsChannel = supabase
        .channel("admin-bookings")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
          },
          () => {
            void loadBookings();
            toast.info("Список бронювань оновлено");
          },
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(bookingsChannel);
      };
    }
  }, [session]);

  const loadBookings = async () => {
    if (!supabase) return;
    setIsLoadingBookings(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading bookings:", error);
      toast.error("Не вдалося завантажити бронювання");
    } else {
      setBookings((data as BookingRow[]) || []);
    }
    setIsLoadingBookings(false);
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    if (!supabase) return;

    // Optimistic update
    const previousBookings = [...bookings];
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));

    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);

    if (error) {
      console.error("Error updating booking status:", error);
      toast.error("Не вдалося оновити статус");
      setBookings(previousBookings); // Revert
    } else {
      toast.success("Статус оновлено");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Ви впевнені, що хочете видалити цей запис?")) return;

    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting booking:", error);
      toast.error("Не вдалося видалити запис");
    } else {
      toast.success("Запис видалено");
      // Realtime subscription will reload, but we can also update locally
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    const { error } = await signIn(email, password);
    setIsSubmittingAuth(false);
    if (error) {
      console.error("Auth error:", error);
      toast.error("Невірний email або пароль");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <img src={logo} alt="D4YS" className="w-14 h-14 object-contain animate-pulse" />
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (session && !isAdmin) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-background p-4 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative">
          <Card className="border-red-500/20 bg-card/70 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500 border border-red-500/20">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <CardTitle className="font-anton text-2xl tracking-wide text-red-500">ДОСТУП ЗАБОРОНЕНО</CardTitle>
              <CardDescription>
                Ваш акаунт ({session.user.email}) не має прав адміністратора.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => void signOut()}
                className="w-full hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40 border-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Вийти з акаунту
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = "/cabinet"} className="w-full">
                Перейти в особистий кабінет
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-background p-4 overflow-hidden">
        {/* Brand background glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-red-500/15 blur-[140px]" />
          <div className="absolute -bottom-52 -left-32 w-[420px] h-[420px] rounded-full bg-red-500/10 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md relative"
        >
          <div className="text-center space-y-3 mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center justify-center relative"
            >
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
              <img src={logo} alt="D4YS STUDIO" className="w-16 h-16 object-contain relative" />
            </motion.div>
            <h1 className="font-anton text-4xl tracking-wide uppercase">
                D4YS <span className="text-gradient-red">Admin</span>
            </h1>
            <p className="text-sm text-muted-foreground font-syne">
              Введіть дані для входу в систему керування студією
            </p>
          </div>

          <div className="glass rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/40">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@d4ys-bc.com"
                    className="pl-10 h-11 bg-background/50 border-white/10 focus:border-primary/50"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-background/50 border-white/10 focus:border-primary/50"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full h-11 font-semibold tracking-wide bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40"
              >
                {isSubmittingAuth ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Увійти
              </Button>
            </form>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад на сайт
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Всього бронювань",
      value: stats.total,
      icon: CalendarCheck,
      className: "text-primary bg-primary/10 border-primary/20",
      sub: `+${newThisWeek} за останні 7 днів`,
    },
    {
      label: "Підтверджено",
      value: stats.confirmed,
      icon: CheckCircle2,
      className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      sub: stats.total > 0 ? `${Math.round((stats.confirmed / stats.total) * 100)}% від усіх` : "—",
    },
    {
      label: "Відвідано",
      value: stats.attended,
      icon: UserCheck,
      className: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      sub: stats.total > 0 ? `${Math.round((stats.attended / stats.total) * 100)}% відвідуваність` : "—",
    },
    {
      label: "Скасовано",
      value: stats.canceled,
      icon: XCircle,
      className: "text-red-500 bg-red-500/10 border-red-500/20",
      sub: stats.total > 0 ? `${Math.round((stats.canceled / stats.total) * 100)}% відмов` : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="D4YS" className="w-9 h-9 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="font-anton text-lg tracking-wide uppercase leading-none">
                Панель <span className="text-gradient-red">керування</span>
              </p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5 hidden xs:block">
                {session.user.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void signOut()}
            className="gap-2 shrink-0 border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Вийти</span>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-8 space-y-6 md:space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {statCards.map(card => (
            <Card
              key={card.label}
              className="bg-card/60 backdrop-blur border-white/10 hover:border-white/20 transition-colors"
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                    {card.label}
                  </p>
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg border flex items-center justify-center shrink-0 ${card.className}`}>
                    <card.icon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold mt-2">{card.value}</p>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="bookings" className="space-y-4 md:space-y-6">
          <div className="sticky top-16 z-30 -mx-4 md:mx-0 px-4 md:px-0 py-2 bg-background/90 backdrop-blur-xl md:static md:bg-transparent md:py-0 md:backdrop-blur-none">
            <TabsList className="w-full justify-start h-auto p-1 rounded-xl border border-white/10 bg-card/60 backdrop-blur overflow-x-auto flex-nowrap">
              <TabsTrigger
                value="bookings"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
              >
                <Users className="w-4 h-4 shrink-0" />
                Бронювання
                {stats.pending > 0 && (
                  <span className="ml-1 min-w-5 h-5 px-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center border border-primary/25">
                    {stats.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                Аналітика
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
              >
                <Settings2 className="w-4 h-4 shrink-0" />
                Налаштування
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bookings" className="space-y-4">
            <AdminBookings
              bookings={bookings}
              isLoading={isLoadingBookings}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteBooking}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics bookings={bookings} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <AdminPricing />
              <AdminSchedule bookings={bookings} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
