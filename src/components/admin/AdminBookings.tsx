
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Search,
  Globe,
  Smartphone,
  Trash2,
  Phone,
  Mail,
  X,
  Eye,
} from "lucide-react";
import { BookingRow, BookingStatus } from "@/lib/types";
import { parseBookingNotes } from "@/lib/utils";
import { bookingStatusLabels, bookingStatusColors } from "@/lib/constants";

interface AdminBookingsProps {
  bookings: BookingRow[];
  isLoading: boolean;
  onStatusChange: (id: string, status: BookingStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: bookingStatusLabels.pending,
    color: bookingStatusColors.pending,
    icon: <Clock className="w-3 h-3 mr-1" />,
  },
  confirmed: {
    label: bookingStatusLabels.confirmed,
    color: bookingStatusColors.confirmed,
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
  canceled: {
    label: bookingStatusLabels.canceled,
    color: bookingStatusColors.canceled,
    icon: <XCircle className="w-3 h-3 mr-1" />,
  },
  attended: {
    label: bookingStatusLabels.attended,
    color: bookingStatusColors.attended,
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long" });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

export function AdminBookings({ bookings, isLoading, onStatusChange, onDelete }: AdminBookingsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      (booking.email && booking.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(booking.created_at) >= new Date(dateFrom);
    }
    if (dateTo) {
      // Add one day to include the end date fully
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      matchesDate = matchesDate && new Date(booking.created_at) < endDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const SourceIcon = ({ booking }: { booking: BookingRow }) =>
    parseBookingNotes(booking.notes).source ? (
      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-background" title="З сайту">
        <Globe className="w-3 h-3 text-white" />
      </div>
    ) : (
      <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-background" title="З кабінету">
        <Smartphone className="w-3 h-3 text-white" />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card/60 backdrop-blur p-4 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Пошук за ім'ям, телефоном або email..."
            className="pl-10 border-white/10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-2 md:justify-end">
          <Select
            value={statusFilter}
            onValueChange={v => setStatusFilter(v as BookingStatus | "all")}
          >
            <SelectTrigger className="w-full md:w-[170px] border-white/10">
              <SelectValue placeholder="Всі статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі статуси</SelectItem>
              <SelectItem value="pending">В очікуванні</SelectItem>
              <SelectItem value="confirmed">Підтверджено</SelectItem>
              <SelectItem value="canceled">Скасовано</SelectItem>
              <SelectItem value="attended">Відвідано</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full md:w-[140px] border-white/10"
            placeholder="Від"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full md:w-[140px] border-white/10"
            placeholder="До"
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1.5 text-muted-foreground hover:text-foreground col-span-2 md:col-span-1"
            >
              <X className="w-4 h-4" />
              Скинути
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground px-1">
        {isLoading ? "Завантаження…" : `Показано ${filteredBookings.length} з ${bookings.length} записів`}
      </p>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-card/60 h-24 flex items-center justify-center text-sm text-muted-foreground">
            Завантаження...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-card/60 py-12 flex flex-col items-center gap-2 text-center">
            <Search className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Записів не знайдено</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <div key={booking.id} className="rounded-xl border border-white/10 bg-card/60 backdrop-blur p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs relative shrink-0">
                    {booking.name.slice(0, 2).toUpperCase()}
                    <SourceIcon booking={booking} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{booking.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.created_at)}, {formatTime(booking.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`${statusConfig[booking.status].color} shrink-0`}>
                  {statusConfig[booking.status].icon}
                  {statusConfig[booking.status].label}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a href={`tel:${booking.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  {booking.phone}
                </a>
                {booking.email && (
                  <a href={`mailto:${booking.email}`} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors min-w-0">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{booking.email}</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-9 gap-1.5 text-xs hover:bg-emerald-500/10 hover:text-emerald-500"
                  onClick={() => void onStatusChange(booking.id, "confirmed")}
                  disabled={booking.status === "confirmed"}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Підтвердити
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-9 gap-1.5 text-xs hover:bg-blue-500/10 hover:text-blue-500"
                  onClick={() => void onStatusChange(booking.id, "attended")}
                  disabled={booking.status === "attended"}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Відвідано
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500"
                  title="Скасувати"
                  onClick={() => void onStatusChange(booking.id, "canceled")}
                  disabled={booking.status === "canceled"}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground"
                  title="Деталі"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500"
                  title="Видалити"
                  onClick={() => void onDelete(booking.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden bg-card/60 backdrop-blur">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Клієнт</TableHead>
              <TableHead>Контакти</TableHead>
              <TableHead>Деталі / Примітки</TableHead>
              <TableHead>Дата створення</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Завантаження...
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Записів не знайдено
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map(booking => (
                <TableRow key={booking.id} className="hover:bg-white/[0.02]">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs relative">
                        {booking.name.slice(0, 2).toUpperCase()}
                        <SourceIcon booking={booking} />
                      </div>
                      <div>
                        <p>{booking.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <a href={`tel:${booking.phone}`} className="hover:text-primary transition-colors">
                        {booking.phone}
                      </a>
                      {booking.email && (
                        <span className="text-muted-foreground text-xs">{booking.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] text-sm text-muted-foreground truncate">
                      {booking.notes || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{formatDate(booking.created_at)}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(booking.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[booking.status].color}>
                      {statusConfig[booking.status].icon}
                      {statusConfig[booking.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                          Деталі
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void onStatusChange(booking.id, "confirmed")}
                        >
                          Підтвердити
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void onStatusChange(booking.id, "attended")}
                        >
                          Відзначити відвідування
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void onStatusChange(booking.id, "canceled")}
                          className="text-red-500 focus:text-red-500"
                        >
                          Скасувати
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => void onDelete(booking.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Видалити
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={open => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-lg border-white/10">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Деталі бронювання</DialogTitle>
                <DialogDescription>
                  Створено{" "}
                  {new Date(selectedBooking.created_at).toLocaleString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-background/40">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm relative">
                    {selectedBooking.name.slice(0, 2).toUpperCase()}
                    <SourceIcon booking={selectedBooking} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{selectedBooking.name}</p>
                    <a href={`tel:${selectedBooking.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {selectedBooking.phone}
                    </a>
                  </div>
                  <Badge variant="outline" className={statusConfig[selectedBooking.status].color}>
                    {statusConfig[selectedBooking.status].icon}
                    {statusConfig[selectedBooking.status].label}
                  </Badge>
                </div>
                {selectedBooking.email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedBooking.email}`} className="font-medium hover:text-primary transition-colors">
                      {selectedBooking.email}
                    </a>
                  </div>
                )}
                {(() => {
                  const details = parseBookingNotes(selectedBooking.notes);
                  return (
                    <div className="space-y-2">
                      {details.comment && (
                        <div>
                          <p className="text-muted-foreground">Коментар</p>
                          <p className="font-medium whitespace-pre-line">{details.comment}</p>
                        </div>
                      )}
                      {details.direction && (
                        <div>
                          <p className="text-muted-foreground">Напрямок</p>
                          <p className="font-medium">{details.direction}</p>
                        </div>
                      )}
                      {details.format && (
                        <div>
                          <p className="text-muted-foreground">Формат</p>
                          <p className="font-medium">{details.format}</p>
                        </div>
                      )}
                      {details.trainer && (
                        <div>
                          <p className="text-muted-foreground">Тренер</p>
                          <p className="font-medium">{details.trainer}</p>
                        </div>
                      )}
                      {details.time && (
                        <div>
                          <p className="text-muted-foreground">Час</p>
                          <p className="font-medium">{details.time}</p>
                        </div>
                      )}
                      {details.source && (
                        <div>
                          <p className="text-muted-foreground">Джерело</p>
                          <p className="font-medium">{details.source}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
