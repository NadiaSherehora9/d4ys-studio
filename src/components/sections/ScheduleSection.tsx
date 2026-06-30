import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react";
import type { TrainingType, SessionMode, Trainer } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface ScheduleSlot {
  type: TrainingType;
  trainerId: string;
  durationMinutes: number;
  mode: SessionMode;
}

interface ClassSchedule {
  time: string;
  monday?: ScheduleSlot;
  tuesday?: ScheduleSlot;
  wednesday?: ScheduleSlot;
  thursday?: ScheduleSlot;
  friday?: ScheduleSlot;
  saturday?: ScheduleSlot;
  sunday?: ScheduleSlot;
}

const trainers: Trainer[] = [
  {
    id: "anastasiia",
    name: "Анастасія",
    styles: ["CHOREO"],
  },
  {
    id: "nadiia",
    name: "Надія",
    styles: ["CHOREO"],
  },
  {
    id: "veronika",
    name: "Вероніка",
    styles: ["JAZZ-FUNK"],
  },
];

const trainerMap = trainers.reduce(
  (acc, trainer) => {
    acc[trainer.id] = trainer;
    return acc;
  },
  {} as Record<string, Trainer>,
);

const schedule: ClassSchedule[] = [
  {
    time: "18:00",
    monday: {
      type: "CHOREO",
      trainerId: "anastasiia",
      durationMinutes: 60,
      mode: "group",
    },
    wednesday: {
      type: "CHOREO",
      trainerId: "nadiia",
      durationMinutes: 60,
      mode: "group",
    },
    friday: {
      type: "CHOREO",
      trainerId: "anastasiia",
      durationMinutes: 60,
      mode: "group",
    },
  },
  {
    time: "19:00",
    tuesday: {
      type: "JAZZ-FUNK",
      trainerId: "veronika",
      durationMinutes: 60,
      mode: "group",
    },
    thursday: {
      type: "JAZZ-FUNK",
      trainerId: "veronika",
      durationMinutes: 60,
      mode: "group",
    },
    saturday: {
      type: "JAZZ-FUNK",
      trainerId: "veronika",
      durationMinutes: 60,
      mode: "group",
    },
  },
];

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const classColors: Record<TrainingType, string> = {
  CHOREO: "bg-primary/20 border-primary text-primary",
  "JAZZ-FUNK": "bg-pink-500/20 border-pink-500 text-pink-400",
};

interface CalendarClass {
  id: string;
  sessionId?: string;
  time: string;
  type: TrainingType;
  trainerName: string;
  durationMinutes: number;
  mode: SessionMode;
  color: string;
}

interface CalendarSession {
  id: string;
  date: string;
  time: string;
  type: TrainingType;
  trainerId: string;
  durationMinutes: number;
  mode: SessionMode;
  active: boolean;
}

interface SelectedClass {
  source: "weekly" | "calendar";
  sessionId?: string;
  label: string;
  time: string;
  type: TrainingType;
  trainerName: string;
  durationMinutes: number;
  mode: SessionMode;
}

interface CalendarLimits {
  minDaysAhead: number;
  maxDaysAhead: number;
}

export const ScheduleSection = () => {
  const { user, profile } = useAuth();
  const [view, setView] = useState<"weekly" | "calendar">("weekly");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState<SelectedClass | null>(
    null,
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingMode, setBookingMode] = useState<SessionMode>("group");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [calendarLimits, setCalendarLimits] = useState<CalendarLimits | null>(
    null,
  );
  const [sessions, setSessions] = useState<CalendarSession[]>([]);

  // Pre-fill user data when booking dialog opens
  useEffect(() => {
    if (isBookingOpen && user) {
      if (profile?.name) setBookingName(profile.name);
      if (profile?.phone) setBookingPhone(profile.phone);
      if (user.email) setBookingEmail(user.email);
    }
  }, [isBookingOpen, user, profile]);

  const loadCalendarLimits = async () => {
    if (!supabase) {
      setCalendarLimits({ minDaysAhead: 0, maxDaysAhead: 30 });
      return;
    }

    const { data, error } = await supabase
      .from("calendar_settings")
      .select("min_days_ahead, max_days_ahead")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setCalendarLimits({ minDaysAhead: 0, maxDaysAhead: 30 });
      return;
    }

    const min = Number.isFinite(data.min_days_ahead) ? data.min_days_ahead : 0;
    const max = Number.isFinite(data.max_days_ahead) ? data.max_days_ahead : 30;
    const safeMin = Math.max(0, min);
    const safeMax = Math.max(safeMin, max);

    setCalendarLimits({ minDaysAhead: safeMin, maxDaysAhead: safeMax });
  };

  useEffect(() => {
    void loadCalendarLimits();
  }, []);

  const loadSessions = async () => {
    if (!supabase) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ty = today.getFullYear();
    const tm = String(today.getMonth() + 1).padStart(2, "0");
    const td = String(today.getDate()).padStart(2, "0");
    const todayStr = `${ty}-${tm}-${td}`;

    const { data, error } = await supabase
      .from("sessions")
      .select(
        "id, date, time, type, trainer_id, duration_minutes, mode, active",
      )
      .gte("date", todayStr)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error || !data) {
      return;
    }

    setSessions(
      data.map((row) => ({
        id: row.id as string,
        date: row.date as string,
        // нормалізуємо час: "18:00:00" → "18:00"
        time: ((row.time as string) ?? "").slice(0, 5),
        type: row.type as TrainingType,
        trainerId: (row as { trainer_id?: string }).trainer_id ?? "",
        durationMinutes:
          (row as { duration_minutes?: number }).duration_minutes ?? 60,
        mode: (row as { mode?: SessionMode }).mode ?? "group",
        active: (row as { active?: boolean }).active ?? true,
      })),
    );
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const sessionsChannel = supabase
      .channel("schedule-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => {
          void loadSessions();
        },
      )
      .subscribe();

    const calendarChannel = supabase
      .channel("schedule-calendar-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendar_settings" },
        () => {
          void loadCalendarLimits();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(sessionsChannel);
      void supabase.removeChannel(calendarChannel);
    };
  }, []);

  const getClassesForDate = (
    selectedDate: Date | undefined,
  ): CalendarClass[] => {
    if (!selectedDate) return [];

    // toISOString() дає UTC дату, яка може зсуватись на день у київському часовому поясі
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const sessionsForDay = sessions.filter(
      (session) => session.active && session.date === dateStr,
    );

    if (sessionsForDay.length > 0) {
      return sessionsForDay.map((session) => {
        const trainer = trainerMap[session.trainerId];

        return {
          id: session.id,
          sessionId: session.id,
          time: session.time,
          type: session.type,
          trainerName: trainer?.name ?? "Тренер",
          durationMinutes: session.durationMinutes,
          mode: session.mode,
          color:
            classColors[session.type] ??
            "bg-primary/20 border-primary text-primary",
        };
      });
    }

    const dayIndex = selectedDate.getDay();
    const dayName = dayIndex === 0 ? "sunday" : days[dayIndex - 1];

    const classesForDay: CalendarClass[] = [];

    schedule.forEach((row) => {
      const slot = row[dayName as keyof ClassSchedule] as
        | ScheduleSlot
        | undefined;
      if (!slot) return;
      const trainer = trainerMap[slot.trainerId];

      classesForDay.push({
        id: `${dayName}-${row.time}-${slot.trainerId}`,
        sessionId: undefined,
        time: row.time,
        type: slot.type,
        trainerName: trainer?.name ?? "Тренер",
        durationMinutes: slot.durationMinutes,
        mode: slot.mode,
        color:
          classColors[slot.type] ?? "bg-primary/20 border-primary text-primary",
      });
    });

    return classesForDay;
  };

  const classesForSelectedDate = getClassesForDate(date);

  const today = new Date();
  const minDaysAhead = calendarLimits?.minDaysAhead ?? 0;
  const maxDaysAhead = calendarLimits?.maxDaysAhead ?? 30;
  const safeMin = Math.max(0, minDaysAhead);
  const safeMax = Math.max(safeMin, maxDaysAhead);

  const fromDate = new Date(today);
  fromDate.setHours(0, 0, 0, 0);
  fromDate.setDate(fromDate.getDate() + safeMin);

  // toDate — максимум з: налаштувань календаря АБО дата найдальшої активної сесії в БД
  const lastSessionDate = sessions
    .filter((s) => s.active && s.date)
    .map((s) => new Date(s.date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const toDateFromSettings = new Date(today);
  toDateFromSettings.setHours(0, 0, 0, 0);
  toDateFromSettings.setDate(toDateFromSettings.getDate() + safeMax);

  const toDate =
    lastSessionDate && lastSessionDate > toDateFromSettings
      ? lastSessionDate
      : toDateFromSettings;

  const openBookingDialog = (
    session: {
      sessionId?: string;
      time: string;
      type: TrainingType;
      trainerName: string;
      durationMinutes: number;
      mode: SessionMode;
    },
    label: string,
    source: "weekly" | "calendar",
  ) => {
    setSelectedClass({
      source,
      sessionId: session.sessionId,
      label,
      time: session.time,
      type: session.type,
      trainerName: session.trainerName,
      durationMinutes: session.durationMinutes,
      mode: session.mode,
    });
    setBookingMode(session.mode);
    setIsBookingOpen(true);
  };

  const openBookingFromCalendar = (
    cls: CalendarClass,
    selectedDate: Date | undefined,
  ) => {
    if (!selectedDate) return;
    const label = selectedDate.toLocaleDateString("uk-UA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    openBookingDialog(
      {
        sessionId: cls.sessionId,
        time: cls.time,
        type: cls.type,
        trainerName: cls.trainerName,
        durationMinutes: cls.durationMinutes,
        mode: cls.mode,
      },
      label,
      "calendar",
    );
  };

  const openBookingFromWeekly = (
    day: (typeof days)[number],
    rowTime: string,
    slot: ScheduleSlot,
  ) => {
    const labelMap: Record<(typeof days)[number], string> = {
      monday: "Понеділок",
      tuesday: "Вівторок",
      wednesday: "Середа",
      thursday: "Четвер",
      friday: "Пʼятниця",
      saturday: "Субота",
      sunday: "Неділя",
    };

    const trainer = trainerMap[slot.trainerId];

    openBookingDialog(
      {
        time: rowTime,
        type: slot.type,
        trainerName: trainer?.name ?? "Тренер",
        durationMinutes: slot.durationMinutes,
        mode: slot.mode,
      },
      `${labelMap[day]} • щотижня`,
      "weekly",
    );
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass) return;

    if (!bookingName.trim() || !bookingPhone.trim()) {
      toast.error("Будь ласка, вкажіть імʼя і телефон");
      return;
    }

    const phoneDigits = bookingPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast.error("Будь ласка, введіть коректний номер телефону");
      return;
    }

    setIsSubmittingBooking(true);

    try {
      if (!supabase) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        toast.success(
          bookingMode === "group"
            ? "Ви успішно записалися на групове заняття"
            : "Запит на персональне заняття відправлено",
          {
            description: `${selectedClass.type} • ${selectedClass.trainerName} • ${selectedClass.time}`,
          },
        );
        setIsBookingOpen(false);
        setSelectedClass(null);
        setBookingName("");
        setBookingPhone("");
        setBookingEmail("");
        setBookingNotes("");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const details = [
        bookingNotes.trim(),
        `Напрямок: ${selectedClass.type}`,
        `Формат: ${bookingMode === "group" ? "Група" : "Персональне"}`,
        `Тренер: ${selectedClass.trainerName}`,
        `Час: ${selectedClass.time}`,
        `Джерело: ${selectedClass.source} (${selectedClass.label})`,
      ]
        .filter(Boolean)
        .join("\n");

      const { error } = await supabase.from("bookings").insert([
        {
          name: bookingName.trim(),
          phone: bookingPhone.trim(),
          email: bookingEmail.trim() || null,
          notes: details,
          status: "pending",
          session_id: selectedClass.sessionId ?? null,
          user_id: userData.user?.id ?? null,
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success(
        bookingMode === "group"
          ? "Ви успішно записалися на групове заняття"
          : "Запит на персональне заняття відправлено",
        {
          description: `${selectedClass.type} • ${selectedClass.trainerName} • ${selectedClass.time}`,
        },
      );
      setIsBookingOpen(false);
      setSelectedClass(null);
      setBookingName("");
      setBookingPhone("");
      setBookingEmail("");
      setBookingNotes("");
    } catch (error) {
      console.error("Error creating booking", error);
      toast.error("Сталася помилка при записі. Спробуйте ще раз.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <section
      id="schedule"
      className="relative py-24 md:py-32 overflow-hidden bg-background/50"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl opacity-50"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Плануй свій тиждень
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase text-foreground mb-8">
            Розклад{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
              занять
            </span>
          </h2>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-secondary/50 p-1 rounded-full flex items-center gap-1 border border-white/5 shadow-lg backdrop-blur-sm">
              <button
                onClick={() => setView("weekly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300",
                  view === "weekly"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                Weekly View
              </button>
              <button
                onClick={() => setView("calendar")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                  view === "calendar"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                <CalendarIcon className="w-4 h-4" />
                My Calendar
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "weekly" ? (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="overflow-x-auto pb-4"
            >
              <div className="min-w-[800px] bg-secondary/10 p-6 rounded-3xl border border-white/5">
                {/* Header Row */}
                <div className="grid grid-cols-8 gap-3 mb-6">
                  <div className="p-4 text-center">
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Time
                    </span>
                  </div>
                  {dayLabels.map((day, index) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 text-center rounded-2xl bg-secondary/30 border border-white/5"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider text-foreground">
                        {day}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Schedule Rows */}
                <div className="space-y-3">
                  {schedule.map((row, rowIndex) => (
                    <motion.div
                      key={row.time}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * rowIndex }}
                      className="grid grid-cols-8 gap-3"
                    >
                      {/* Time Column */}
                      <div className="p-4 flex items-center justify-center rounded-2xl bg-secondary/20 border border-white/5">
                        <span className="text-lg font-black text-foreground/80">
                          {row.time}
                        </span>
                      </div>

                      {/* Day Columns */}
                      {days.map((day) => {
                        const slot = row[day];
                        const trainer = slot
                          ? trainerMap[slot.trainerId]
                          : null;
                        const colorClass = slot ? classColors[slot.type] : "";
                        return (
                          <button
                            type="button"
                            key={`${row.time}-${day}`}
                            onClick={
                              slot
                                ? () =>
                                    openBookingFromWeekly(day, row.time, slot)
                                : undefined
                            }
                            className={cn(
                              "relative p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center min-h-[80px] group",
                              slot
                                ? `${colorClass} hover:scale-[1.02] hover:shadow-lg cursor-pointer`
                                : "bg-transparent border-transparent",
                            )}
                          >
                            {slot ? (
                              <>
                                <div className="text-center leading-tight">
                                  <span className="block text-xs md:text-[13px] font-bold uppercase tracking-wider">
                                    {slot.type}
                                  </span>
                                  {trainer && (
                                    <span className="mt-1 block text-[11px] uppercase tracking-widest opacity-80">
                                      {trainer.name}
                                    </span>
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                              </>
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-12 gap-8 lg:gap-12"
            >
              {/* Calendar Column */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  fromDate={fromDate}
                  toDate={toDate}
                  disabled={
                    calendarLimits
                      ? [{ before: fromDate }, { after: toDate }]
                      : undefined
                  }
                  className="rounded-3xl border-0 shadow-2xl bg-secondary/10 backdrop-blur-sm p-6 w-full max-w-[400px]"
                />
              </div>

              {/* Classes List Column */}
              <div className="lg:col-span-7">
                <div className="bg-secondary/10 rounded-3xl p-6 md:p-8 border border-white/5 h-full min-h-[400px]">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-primary">
                      {date
                        ? date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })
                        : "Select a Date"}
                    </span>
                    {date && (
                      <span className="text-muted-foreground text-base font-normal">
                        Classes
                      </span>
                    )}
                  </h3>

                  <div className="space-y-4">
                    {classesForSelectedDate.length > 0 ? (
                      classesForSelectedDate.map((cls, idx) => (
                        <motion.div
                          key={cls.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={cn(
                            "group flex items-center justify-between p-4 md:p-6 rounded-2xl border transition-all duration-300 hover:shadow-md",
                            cls.color,
                          )}
                        >
                          <div className="flex items-center gap-4 md:gap-6">
                            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-background/20 backdrop-blur-md">
                              <Clock className="w-5 h-5 mb-1 opacity-80" />
                              <span className="text-sm font-bold">
                                {cls.time}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xl font-black uppercase tracking-wide mb-1">
                                {cls.type}
                              </h4>
                              <p className="text-xs md:text-sm opacity-80 uppercase tracking-widest font-medium">
                                {cls.trainerName} • {cls.durationMinutes} хв •{" "}
                                {cls.mode === "group" ? "Група" : "Персональне"}
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => openBookingFromCalendar(cls, date)}
                            className="rounded-full bg-background/20 hover:bg-background/40 border-0 text-inherit font-bold uppercase tracking-wider h-12 px-6"
                          >
                            Записатися{" "}
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground"
                      >
                        <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">
                          No classes scheduled for this day.
                        </p>
                        <p className="text-sm opacity-60">
                          Try selecting another date or check our weekly view.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend (Only show for weekly view or if needed generally) */}
        {view === "weekly" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {Object.entries(classColors).map(([name, colorClass], index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full border bg-background/50 backdrop-blur-sm",
                  colorClass,
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    colorClass.includes("primary")
                      ? "bg-primary"
                      : colorClass.includes("accent")
                        ? "bg-accent"
                        : "bg-foreground/50",
                  )}
                />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  {name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-lg">
          {selectedClass && (
            <>
              <DialogHeader>
                <DialogTitle>Запис на заняття</DialogTitle>
                <DialogDescription>
                  {selectedClass.label} • {selectedClass.time}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Напрямок</p>
                    <p className="font-semibold uppercase tracking-widest">
                      {selectedClass.type}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Тренер</p>
                    <p className="font-semibold">{selectedClass.trainerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Тривалість</p>
                    <p className="font-semibold">
                      {selectedClass.durationMinutes} хв
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Формат</p>
                    <p className="font-semibold">
                      {bookingMode === "group"
                        ? "Групове заняття"
                        : "Персональне"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <Button
                    type="button"
                    variant={bookingMode === "group" ? "default" : "outline"}
                    onClick={() => setBookingMode("group")}
                    className="flex-1"
                  >
                    Група
                  </Button>
                  <Button
                    type="button"
                    variant={bookingMode === "personal" ? "default" : "outline"}
                    onClick={() => setBookingMode("personal")}
                    className="flex-1"
                  >
                    Персональне
                  </Button>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Імʼя</label>
                    <Input
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Ваше імʼя"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Телефон</label>
                    <Input
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="+380..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Email (необовʼязково)
                    </label>
                    <Input
                      type="email"
                      value={bookingEmail}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Коментар</label>
                    <Textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Рівень, побажання, зручний час тощо"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {isSubmittingBooking
                      ? "Надсилання..."
                      : "Підтвердити запис"}
                  </Button>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
