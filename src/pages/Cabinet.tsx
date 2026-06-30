
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn, parseBookingNotes } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { BookingRow } from "@/lib/types";
import { bookingStatusLabels, bookingStatusColors } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  LogOut, 
  User as UserIcon, 
  Calendar, 
  Copy, 
  Check, 
  RefreshCw,
  Mail,
  Shield,
  Clock
} from "lucide-react";
import { toast } from "sonner";

const Cabinet = () => {
  const { user, profile, signIn, signUp, signOut, resetPassword, updatePassword, isLoading: authLoading } = useAuth();
  
  // Auth Form State
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  // App State
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Check for recovery URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("type") === "recovery") {
      setShowUpdatePassword(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load bookings when user is available
  useEffect(() => {
    if (user) {
      void loadBookings(user.id);
    } else {
      setBookings([]);
    }
  }, [user]);

  // Realtime updates
  useEffect(() => {
    if (!supabase || !user) return;

    const channel = supabase
      .channel(`cabinet-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        payload => {
          const newUserId = (payload.new as { user_id?: string | null } | null)?.user_id;
          const oldUserId = (payload.old as { user_id?: string | null } | null)?.user_id;

          if (newUserId === user.id || oldUserId === user.id) {
            void loadBookings(user.id, true);
            toast.info("Дані оновлено");
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const loadBookings = async (uid: string, silent = false) => {
    if (!supabase) return;
    if (!silent) setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setBookings(data as BookingRow[]);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      if (!silent) toast.error("Не вдалося завантажити ваші бронювання.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const handleAuth = async () => {
    if (!supabase) return;
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      if (!userEmail || !userPassword) {
        setAuthError("Вкажіть email і пароль");
        return;
      }

      if (authMode === "signup") {
        if (userPassword !== confirmPassword) {
          setAuthError("Паролі не співпадають");
          return;
        }
        if (!userName.trim()) {
          setAuthError("Вкажіть ваше ім'я (нікнейм)");
          return;
        }

        const { error } = await signUp(userEmail, userPassword, { name: userName });
        
        if (error) {
          let message = error.message;
          if (message.includes("User already registered")) message = "Користувач з таким email вже існує.";
          if (message.includes("Password should be at least")) message = "Пароль має бути мінімум 6 символів.";
          setAuthError(message);
          return;
        }

        // Show success message dialog
        setShowRegistrationSuccess(true);
        // Reset form
        setUserEmail("");
        setUserPassword("");
        setConfirmPassword("");
        setUserName("");
        
      } else {
        const { error } = await signIn(userEmail, userPassword);
        if (error) {
          let message = error.message;
          if (message.includes("Email not confirmed")) {
            message = "Email не підтверджено. Перевірте пошту.";
          } else if (message.includes("Invalid login credentials")) {
            message = "Невірний email або пароль.";
          }
          setAuthError(message);
          return;
        }
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      toast.error("Введіть email");
      return;
    }
    
    setIsSubmittingAuth(true);
    const { error } = await resetPassword(userEmail);
    setIsSubmittingAuth(false);

    if (error) {
      console.error(error);
      toast.error("Помилка при відправці запиту");
    } else {
      toast.success("Інструкції відправлено на email");
      setShowForgotPassword(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userPassword !== confirmPassword) {
      toast.error("Паролі не співпадають");
      return;
    }
    
    setIsSubmittingAuth(true);
    const { error } = await updatePassword(userPassword);
    setIsSubmittingAuth(false);

    if (error) {
      console.error(error);
      toast.error("Не вдалося оновити пароль");
    } else {
      toast.success("Пароль успішно оновлено");
      setShowUpdatePassword(false);
      setUserPassword("");
      setConfirmPassword("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("ID скопійовано");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const openProfileDialog = () => {
    if (profile) {
      setProfileName(profile.name ?? "");
      setProfilePhone(profile.phone ?? "");
    } else if (user) {
        setProfileName(user.user_metadata?.name ?? "");
    }
    setProfileError(null);
    setIsProfileDialogOpen(true);
  };

  const handleProfileSave = async () => {
    if (!supabase || !user) return;
    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const name = profileName.trim();
      const phone = profilePhone.trim();

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: name.length > 0 ? name : null,
          phone: phone.length > 0 ? phone : null,
          email: user.email,
          role: profile?.role ?? "user",
        });

      if (error) throw error;

      toast.success("Профіль оновлено");
      setIsProfileDialogOpen(false);
      // We might want to trigger a profile reload in context, but for now Supabase realtime might handle it?
      // AuthContext listens to onAuthStateChange, but not table changes.
      // Ideally we should have a way to refresh profile in AuthContext.
      // But page reload will fix it.
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError("Не вдалося зберегти профіль. Спробуйте ще раз.");
      toast.error("Не вдалося зберегти профіль.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background text-foreground overflow-hidden">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12 text-center"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-4"
          >
            Personal Area
          </motion.span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-4">
            Особистий <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">кабінет</span>
          </h1>
          
          {user && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => void signOut()}
                className="gap-2 border-white/10 hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                Вийти
              </Button>
            </div>
          )}
        </motion.div>

        {!supabase && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="mb-8 border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <p className="text-amber-500 font-medium flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Backend не підключено. Функціонал обмежено.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {authLoading ? (
          <div className="flex justify-center mt-12">
            <Card className="max-w-md w-full border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl">
              <CardContent className="py-16 flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Loader2 className="w-8 h-8 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Завантаження вашого кабінету...
                </p>
              </CardContent>
            </Card>
          </div>
        ) : !user ? (
          <div className="flex justify-center mt-8">
            <motion.div
              className="max-w-md w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-white/5 bg-gradient-to-b from-white/10 to-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                <CardHeader className="text-center pb-2 pt-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-6 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10"
                  >
                    <UserIcon className="w-8 h-8" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    Ласкаво просимо
                  </CardTitle>
                  <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                    Увійдіть або створіть акаунт для керування своїми записами
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-8 pb-10">
                  <Tabs defaultValue="signin" onValueChange={(v) => { setAuthMode(v as "signin" | "signup"); setAuthError(null); }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 p-1 h-auto rounded-xl border border-white/5">
                      <TabsTrigger 
                        value="signin" 
                        className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                      >
                        Вхід
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup"
                        className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                      >
                        Реєстрація
                      </TabsTrigger>
                    </TabsList>
                    
                    <form onSubmit={(e) => { e.preventDefault(); void handleAuth(); }} className="space-y-4">
                        <TabsContent value="signup" className="space-y-4 mt-0 animate-in slide-in-from-top-2 duration-300">
                             <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Нікнейм</label>
                                <Input
                                    type="text"
                                    placeholder="Ваше ім'я"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                                />
                             </div>
                        </TabsContent>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
                            <Input
                                type="email"
                                placeholder="example@mail.com"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Пароль</label>
                                {authMode === "signin" && (
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Забули пароль?
                                    </button>
                                )}
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={userPassword}
                                onChange={(e) => setUserPassword(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <TabsContent value="signup" className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Підтвердження паролю</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                            />
                        </TabsContent>

                        {authError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                {authError}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full h-11 text-base font-semibold mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" 
                            disabled={isSubmittingAuth}
                        >
                            {isSubmittingAuth ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Обробка...
                                </>
                            ) : (
                                authMode === "signin" ? "Увійти в кабінет" : "Створити акаунт"
                            )}
                        </Button>
                    </form>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Profile */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="border-white/5 bg-white/5 backdrop-blur-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent" />
                <CardContent className="pt-12 pb-8 px-6 text-center relative z-10">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                            {getInitials(profile?.name || user.email || "U")}
                        </AvatarFallback>
                    </Avatar>
                    <button 
                        onClick={openProfileDialog}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                        title="Редагувати профіль"
                    >
                        <UserIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-1">{profile?.name || "Користувач"}</h2>
                  <p className="text-muted-foreground text-sm mb-6">{user.email}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                        <p className="text-2xl font-bold text-primary">{bookings.length}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Всього</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/50 border border-white/5">
                        <p className="text-2xl font-bold text-emerald-500">
                            {bookings.filter(b => b.status === 'attended').length}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Відвідано</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                        <span className="text-muted-foreground">ID користувача</span>
                        <div className="flex items-center gap-2">
                            <code className="bg-black/40 px-2 py-0.5 rounded text-xs font-mono text-primary/80">
                                {user.id.slice(0, 8)}...
                            </code>
                            <button 
                                onClick={() => copyToClipboard(user.id)}
                                className="text-muted-foreground hover:text-white transition-colors"
                            >
                                {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                        <span className="text-muted-foreground">Телефон</span>
                        <span className="font-medium">{profile?.phone || "-"}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                        <span className="text-muted-foreground">Роль</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {profile?.role === 'admin' ? 'Адміністратор' : 'Клієнт'}
                        </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Sign Out */}
              <div className="md:hidden">
                <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => void signOut()}
                >
                    <LogOut className="w-4 h-4" />
                    Вийти з акаунту
                </Button>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Мої бронювання
                    </h3>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => void loadBookings(user.id)}
                        disabled={isRefreshing}
                        className={cn("gap-2", isRefreshing && "opacity-70")}
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        <span className="hidden sm:inline">Оновити</span>
                    </Button>
                </div>

                <AnimatePresence mode="popLayout">
                    {bookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="border-dashed border-white/10 bg-white/5">
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                                        <Calendar className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-lg font-medium mb-2">У вас поки немає бронювань</p>
                                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                                        Запишіться на заняття через розклад на головній сторінці
                                    </p>
                                    <Button variant="secondary" onClick={() => window.location.href = "/#schedule"}>
                                        Перейти до розкладу
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking, index) => {
                                const { direction, time, format, trainer } = parseBookingNotes(booking.notes);
                                const title = direction || "Заняття";
                                const details = [time, format, trainer].filter(Boolean).join(" • ");

                                return (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex flex-col sm:flex-row">
                                                <div className={cn("w-full sm:w-2 h-2 sm:h-auto", bookingStatusColors[booking.status].split(" ")[0])} />
                                                <CardContent className="flex-1 p-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-bold text-lg">{title}</h4>
                                                                <Badge variant="outline" className={bookingStatusColors[booking.status]}>
                                                                    {bookingStatusLabels[booking.status]}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{details}</p>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(booking.created_at).toLocaleDateString('uk-UA')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(booking.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {booking.status === 'pending' && (
                                                            <div className="flex items-center gap-2">
                                                                {/* User actions if needed */}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showRegistrationSuccess} onOpenChange={setShowRegistrationSuccess}>
        <DialogContent className="max-w-md border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2 ring-1 ring-primary/20"
            >
              <Mail className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
            </motion.div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight text-primary">
              Дякуємо за реєстрацію!
            </DialogTitle>
            <DialogDescription className="text-base pt-2 text-foreground/80 leading-relaxed">
              Ласкаво просимо до <span className="font-bold text-foreground">D4YS Studio</span>!
              <br /><br />
              Ми надіслали лист підтвердження на вашу пошту.
              Будь ласка, перевірте вхідні (та папку Спам) і <span className="text-primary font-bold">підтвердіть email</span> для активації акаунту.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-6 pb-2">
            <Button 
              size="lg"
              className="w-full font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" 
              onClick={() => {
                setShowRegistrationSuccess(false);
                setAuthMode("signin");
              }}
            >
              Зрозуміло, увійти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Редагування профілю</DialogTitle>
                <DialogDescription>
                    Змініть свої контактні дані тут. Натисніть "Зберегти" коли закінчите.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Ім'я</label>
                    <Input 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)} 
                        placeholder="Ваше ім'я"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Телефон</label>
                    <Input 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)} 
                        placeholder="+380..."
                    />
                </div>
                {profileError && (
                    <p className="text-sm text-red-500">{profileError}</p>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsProfileDialogOpen(false)}>Скасувати</Button>
                <Button onClick={() => void handleProfileSave()} disabled={isSavingProfile}>
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Зберегти"}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Відновлення паролю</DialogTitle>
            <DialogDescription>
              Введіть ваш email, і ми надішлемо інструкції для скидання паролю.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="example@mail.com"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForgotPassword(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isSubmittingAuth}>
                {isSubmittingAuth ? <Loader2 className="w-4 h-4 animate-spin" /> : "Надіслати"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Password Dialog */}
      <Dialog open={showUpdatePassword} onOpenChange={setShowUpdatePassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Встановлення нового паролю</DialogTitle>
            <DialogDescription>
              Придумайте новий надійний пароль для вашого акаунту.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Новий пароль</label>
              <Input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Підтвердження паролю</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={isSubmittingAuth} className="w-full">
                {isSubmittingAuth ? <Loader2 className="w-4 h-4 animate-spin" /> : "Змінити пароль"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cabinet;
