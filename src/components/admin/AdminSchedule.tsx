import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { CalendarSettings, SessionFormState, BookingRow } from "@/lib/types";
import { trainers, trainingTypes, sessionModes } from "@/lib/constants";
import { Loader2 } from "lucide-react";

const defaultCalendarSettings: CalendarSettings = {
  minDaysAhead: 0,
  maxDaysAhead: 30,
};

interface AdminScheduleProps {
  bookings: BookingRow[];
}

export function AdminSchedule({ bookings }: AdminScheduleProps) {
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>(
    defaultCalendarSettings,
  );
  const [isSavingCalendar, setIsSavingCalendar] = useState(false);
  const [sessions, setSessions] = useState<SessionFormState[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionFormState | null>(
    null,
  );
  const [isSavingSession, setIsSavingSession] = useState(false);

  useEffect(() => {
    void loadCalendarSettings();
    void loadSessions();

    if (!supabase) return;

    const sessionsChannel = supabase
      .channel("admin-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => {
          void loadSessions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(sessionsChannel);
    };
  }, []);

  const loadCalendarSettings = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("calendar_settings")
      .select("min_days_ahead, max_days_ahead")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setCalendarSettings(defaultCalendarSettings);
      return;
    }

    setCalendarSettings({
      minDaysAhead: data.min_days_ahead ?? defaultCalendarSettings.minDaysAhead,
      maxDaysAhead: data.max_days_ahead ?? defaultCalendarSettings.maxDaysAhead,
    });
  };

  const loadSessions = async () => {
    if (!supabase) return;
    setIsLoadingSessions(true);

    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(
          "id, date, time, type, trainer_id, duration_minutes, mode, capacity, active",
        )
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error || !data) {
        setSessions([]);
        return;
      }

      setSessions(
        data.map((row) => ({
          id: String((row as { id: string | number }).id),
          date: (row as { date?: string }).date ?? "",
          time: (row as { time?: string }).time ?? "",
          type: (row as { type?: string }).type ?? "",
          trainerId: (row as { trainer_id?: string }).trainer_id ?? "",
          durationMinutes:
            (row as { duration_minutes?: number }).duration_minutes ?? 60,
          mode: (row as { mode?: "group" | "personal" }).mode ?? "group",
          capacity: (row as { capacity?: number }).capacity ?? 12,
          active: (row as { active?: boolean }).active ?? true,
        })),
      );
    } catch (error) {
      console.error("Failed to load sessions", error);
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleCalendarSave = async () => {
    setIsSavingCalendar(true);

    try {
      if (!supabase) {
        toast.success(
          "Налаштування календаря оновлено (локально для цієї сесії)",
        );
        return;
      }

      const { error } = await supabase.from("calendar_settings").upsert({
        id: 1,
        min_days_ahead: calendarSettings.minDaysAhead,
        max_days_ahead: calendarSettings.maxDaysAhead,
      });

      if (error) {
        throw error;
      }

      toast.success("Налаштування календаря збережено");
    } catch (error) {
      console.error("Failed to save calendar settings", error);
      toast.error("Не вдалося зберегти налаштування календаря.");
    } finally {
      setIsSavingCalendar(false);
    }
  };

  const handleSaveSession = async () => {
    if (!supabase || !editingSession) return;
    setIsSavingSession(true);

    try {
      const payload = {
        date: editingSession.date,
        time: editingSession.time,
        type: editingSession.type,
        trainer_id: editingSession.trainerId,
        duration_minutes: editingSession.durationMinutes,
        mode: editingSession.mode,
        capacity: editingSession.capacity,
        active: editingSession.active,
      };

      if (editingSession.id) {
        const { error } = await supabase
          .from("sessions")
          .update(payload)
          .eq("id", editingSession.id);
        if (error) {
          throw error;
        }
        toast.success("Заняття оновлено");
      } else {
        const { error } = await supabase.from("sessions").insert(payload);
        if (error) {
          throw error;
        }
        toast.success("Заняття створено");
      }

      await loadSessions();
      setEditingSession(null);
    } catch (error) {
      console.error("Failed to save session", error);
      toast.error("Не вдалося зберегти заняття.");
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleDeleteSession = async (id?: string) => {
    if (!supabase || !id) return;
    if (!confirm("Видалити це заняття?")) return;

    try {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) {
        throw error;
      }
      toast.success("Заняття видалено");
      await loadSessions();
    } catch (error) {
      console.error("Failed to delete session", error);
      toast.error("Не вдалося видалити заняття.");
    }
  };

  const handleToggleSessionActive = async (
    session: SessionFormState,
    active: boolean,
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, active } : s)),
    );

    if (!supabase || !session.id) return;

    const { error } = await supabase
      .from("sessions")
      .update({ active })
      .eq("id", session.id);

    if (error) {
      toast.error("Не вдалося змінити статус заняття.");
      await loadSessions();
    } else {
      toast.success(active ? "Заняття активовано" : "Заняття вимкнено");
    }
  };

  const bookingsBySessionId = bookings.reduce<Record<string, number>>(
    (acc, booking) => {
      const sessionId = (booking as { session_id?: string | null }).session_id;
      if (!sessionId) return acc;
      acc[sessionId] = (acc[sessionId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-white/10">
        <CardHeader>
          <CardTitle>Налаштування календаря розкладу</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Обмеження по кількості днів, на які клієнт може записатися наперед.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Мінімум днів наперед</p>
              <Input
                type="number"
                min={0}
                value={calendarSettings.minDaysAhead}
                onChange={(e) =>
                  setCalendarSettings((prev) => ({
                    ...prev,
                    minDaysAhead: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Максимум днів наперед</p>
              <Input
                type="number"
                min={0}
                value={calendarSettings.maxDaysAhead}
                onChange={(e) => {
                  const value = Math.max(0, Number(e.target.value) || 0);
                  setCalendarSettings((prev) => ({
                    ...prev,
                    maxDaysAhead: value,
                  }));
                }}
              />
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => void handleCalendarSave()}
            disabled={isSavingCalendar}
          >
            {isSavingCalendar ? "Збереження..." : "Зберегти налаштування"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-white/10">
        <CardHeader>
          <CardTitle>Календар тренувань</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Створюйте заняття, які будуть доступні для запису через календар.
            </p>
            <Button
              size="sm"
              onClick={() => {
                const today = new Date();
                const dateStr = today.toISOString().slice(0, 10);
                setEditingSession({
                  date: dateStr,
                  time: "18:00",
                  type: trainingTypes[0]?.value ?? "",
                  trainerId: trainers[0]?.id ?? "",
                  durationMinutes: 60,
                  mode: "group",
                  capacity: 12,
                  active: true,
                });
              }}
            >
              Нове заняття
            </Button>
          </div>
          {isLoadingSessions ? (
            <p className="text-sm text-muted-foreground">
              Завантаження занять...
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Поки що немає запланованих занять.
            </p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
              {sessions.map((session) => {
                const trainer = trainers.find(
                  (t) => t.id === session.trainerId,
                );
                const booked = bookingsBySessionId[session.id ?? ""] ?? 0;
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3 bg-background/40"
                  >
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold">
                        {session.date} • {session.time}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">
                        {session.type} • {trainer?.name ?? "Тренер"} •{" "}
                        {session.durationMinutes} хв •{" "}
                        {session.mode === "group" ? "Група" : "Персональне"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Бронювань: {booked}/{session.capacity}
                        {!session.active && " • неактивне"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={session.active}
                        onCheckedChange={(value) =>
                          void handleToggleSessionActive(session, value)
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSession(session)}
                      >
                        Редагувати
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDeleteSession(session.id)}
                      >
                        Видалити
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
      >
        <DialogContent className="max-w-md">
          {editingSession && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {editingSession.id ? "Редагування заняття" : "Нове заняття"}
                </DialogTitle>
                <DialogDescription>
                  Заповніть форму нижче, щоб{" "}
                  {editingSession.id ? "оновити" : "створити"} заняття в
                  календарі.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-semibold text-muted-foreground">
                      Дата
                    </label>
                    <Input
                      type="date"
                      value={editingSession.date}
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-semibold text-muted-foreground">
                      Час
                    </label>
                    <Input
                      type="time"
                      value={editingSession.time}
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-semibold text-muted-foreground">
                    Напрямок
                  </label>
                  <Select
                    value={editingSession.type}
                    onValueChange={(val) =>
                      setEditingSession({ ...editingSession, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-semibold text-muted-foreground">
                    Тренер
                  </label>
                  <Select
                    value={editingSession.trainerId}
                    onValueChange={(val) =>
                      setEditingSession({ ...editingSession, trainerId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trainers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-semibold text-muted-foreground">
                      Тривалість (хв)
                    </label>
                    <Input
                      type="number"
                      value={editingSession.durationMinutes}
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          durationMinutes: Number(e.target.value) || 60,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-semibold text-muted-foreground">
                      Кількість місць
                    </label>
                    <Input
                      type="number"
                      value={editingSession.capacity}
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          capacity: Number(e.target.value) || 12,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-semibold text-muted-foreground">
                    Формат
                  </label>
                  <Select
                    value={editingSession.mode}
                    onValueChange={(val) =>
                      setEditingSession({
                        ...editingSession,
                        mode: val as "group" | "personal",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionModes.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={editingSession.active}
                    onCheckedChange={(checked) =>
                      setEditingSession({ ...editingSession, active: checked })
                    }
                  />
                  <span className="text-sm">Активне заняття</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingSession(null)}>
                  Скасувати
                </Button>
                <Button
                  onClick={() => void handleSaveSession()}
                  disabled={isSavingSession}
                >
                  {isSavingSession && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Зберегти
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
