import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Eye, 
  Lock,
  Clock,
  MapPin
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from "date-fns";
import { sl } from "date-fns/locale";
import { SupabaseService } from "@/services/supabaseService";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.family_id) {
      fetchEvents();
    }
  }, [status, session, router]);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await SupabaseService.getReminders(session?.user?.family_id as string);
    if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-6 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: sl })}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
    return (
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {days.map((day, i) => (
          <div key={i} className="py-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const rows = [];
    let days = [];

    calendarDays.forEach((day, i) => {
      const dayEvents = events.filter(event => isSameDay(parseISO(event.start_time), day));
      
      days.push(
        <div
          key={day.toString()}
          className={cn(
            "min-h-[80px] border-r border-b border-border p-1 transition-colors relative",
            !isSameMonth(day, monthStart) ? "bg-muted/10 text-muted-foreground/50" : "bg-card",
            isSameDay(day, new Date()) && "bg-primary/5",
            isSameDay(day, selectedDate) && "ring-2 ring-primary ring-inset z-10"
          )}
          onClick={() => setSelectedDate(day)}
        >
          <span className={cn(
            "text-xs font-semibold ml-1 mt-1 block h-5 w-5 flex items-center justify-center rounded-full",
            isSameDay(day, new Date()) && "bg-primary text-white"
          )}>
            {format(day, "d")}
          </span>
          <div className="mt-1 space-y-1 overflow-hidden">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="text-[10px] px-1 py-0.5 rounded truncate leading-tight flex items-center gap-1"
                style={{ backgroundColor: (event.category?.color || '#6495ED') + '33', borderLeft: `2px solid ${event.category?.color || '#6495ED'}` }}
              >
                {event.category?.visibility_level === 'parents' && <Lock className="w-2 h-2" />}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-muted-foreground pl-1">
                + {dayEvents.length - 3} več
              </div>
            )}
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="bg-border">{rows}</div>;
  };

  const renderSelectedDayEvents = () => {
    const eventsForSelectedDay = selectedDate 
      ? events.filter((e) => isSameDay(new Date(e.start_time), selectedDate))
      : [];
    
    return (
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">
            {format(selectedDate, "eeee, d. MMMM", { locale: sl })}
          </h2>
          <Button size="sm" className="rounded-full gap-2" onClick={() => router.push('/reminders')}>
            <Plus className="w-4 h-4" />
            Dodaj
          </Button>
        </div>

        {eventsForSelectedDay.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 bg-muted/20">
            <p className="text-muted-foreground italic">Ni opomnikov za ta dan.</p>
          </Card>
        ) : (
          eventsForSelectedDay.map((event) => (
            <Card key={event.id} className="p-4 border-l-4 shadow-sm" style={{ borderLeftColor: event.category?.color || '#6495ED' }}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{event.title}</h3>
                    {event.category?.visibility_level === 'parents' ? (
                      <Badge variant="outline" className="text-[10px] py-0 h-4 gap-1">
                        <Lock className="w-2 h-2" /> Starši
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0 h-4 gap-1 text-[#6495ED] border-[#6495ED]">
                        <Eye className="w-2 h-2" /> Vsi
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {event.is_all_day 
                        ? "Celodnevni" 
                        : `${format(parseISO(event.start_time), "HH:mm")} — ${format(parseISO(event.end_time), "HH:mm")}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  if (status === "loading" || (loading && events.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Koledar - FamilySync" />
      <div className="min-h-screen pb-24 bg-background">
        {renderHeader()}
        <div className="container max-w-4xl p-0 md:p-4">
          <Card className="overflow-hidden border-border shadow-md">
            {renderDays()}
            {renderCells()}
          </Card>
          {renderSelectedDayEvents()}
        </div>
      </div>
      <BottomNav />
    </>
  );
}