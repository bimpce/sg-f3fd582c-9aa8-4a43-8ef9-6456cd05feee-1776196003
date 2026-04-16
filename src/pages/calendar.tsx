import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Eye, 
  Lock,
  Clock
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
  eachDayOfInterval,
  parseISO
} from "date-fns";
import { sl } from "date-fns/locale";
import { SupabaseService } from "@/services/supabaseService";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [endDate, setEndDate] = useState(format(new Date(new Date().getTime() + 3600000), "yyyy-MM-dd'T'HH:mm"));
  const [categoryId, setCategoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.family_id) {
      fetchEvents();
    }
  }, [status, session, router]);

  const fetchEvents = async () => {
    setLoading(true);
    const familyId = session?.user?.family_id as string;
    const [fetchedReminders, fetchedCategories] = await Promise.all([
      SupabaseService.getReminders(familyId),
      SupabaseService.getCategories(familyId),
    ]);
    if (fetchedReminders) setEvents(fetchedReminders);
    if (fetchedCategories) setCategories(fetchedCategories);
    setLoading(false);
  };

  const openCreateModal = (day: Date) => {
    setSelectedDate(day);
    setTitle("");
    setIsAllDay(false);
    
    const start = new Date(day);
    start.setHours(12, 0, 0, 0);
    setStartDate(format(start, "yyyy-MM-dd'T'HH:mm"));
    
    const end = new Date(day);
    end.setHours(13, 0, 0, 0);
    setEndDate(format(end, "yyyy-MM-dd'T'HH:mm"));
    
    setCategoryId("");
    setIsReminderOpen(true);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !session?.user) return;
    setIsSubmitting(true);
    try {
      let startObj = new Date(startDate);
      let endObj = new Date(endDate);
      
      if (isAllDay) {
        startObj = new Date(startDate);
        startObj.setHours(0, 0, 0, 0);
        endObj = new Date(endDate);
        endObj.setHours(23, 59, 59, 999);
      }

      const result = await SupabaseService.createReminder({
        title,
        start_time: startObj.toISOString(),
        end_time: endObj.toISOString(),
        is_all_day: isAllDay,
        category_id: categoryId || null,
        family_id: session.user.family_id as string,
        creator_id: session.user.id,
        completed: false
      });
      
      if (result) {
        toast({ title: "Opomnik dodan", description: "Vaš novi opomnik je bil uspešno shranjen." });
        setIsReminderOpen(false);
        fetchEvents();
      } else {
        toast({ title: "Napaka", description: "Opomnika ni bilo mogoče shraniti.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Napaka", description: "Prišlo je do nepričakovane napake.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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
    const startDateCal = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDateCal = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDateCal, end: endDateCal });
    const rows = [];
    let days = [];

    calendarDays.forEach((day, i) => {
      const dayEvents = events.filter(event => isSameDay(parseISO(event.start_time), day));
      
      days.push(
        <div
          key={day.toString()}
          className={cn(
            "min-h-[80px] border-r border-b border-border p-1 transition-colors relative flex flex-col cursor-pointer group",
            !isSameMonth(day, monthStart) ? "bg-muted/10 text-muted-foreground/50" : "bg-card hover:bg-muted/20",
            isSameDay(day, new Date()) && "bg-primary/5",
            isSameDay(day, selectedDate) && "ring-2 ring-primary ring-inset z-10"
          )}
          onClick={() => setSelectedDate(day)}
          onDoubleClick={() => openCreateModal(day)}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-xs font-semibold ml-1 mt-1 h-5 w-5 flex items-center justify-center rounded-full",
              isSameDay(day, new Date()) && "bg-primary text-white"
            )}>
              {format(day, "d")}
            </span>
            <span 
              className="opacity-0 md:group-hover:opacity-100 text-primary p-1 rounded-full hover:bg-primary/10 transition-opacity z-20"
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal(day);
              }}
              title="Dodaj opomnik"
            >
              <Plus className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-1 space-y-1 overflow-hidden">
            {dayEvents.slice(0, 3).map((event) => {
              const catColor = event.category?.color || '#6495ED';
              return (
                <div
                  key={event.id}
                  className="text-[10px] px-1.5 py-0.5 rounded truncate leading-tight flex items-center gap-1 font-medium"
                  style={{ 
                    backgroundColor: `${catColor}15`, 
                    color: catColor,
                    borderLeft: `2px solid ${catColor}` 
                  }}
                >
                  {event.category?.visibility_level === 'parents' && <Lock className="w-2.5 h-2.5 flex-shrink-0" />}
                  {event.title}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <div className="text-[10px] font-medium text-muted-foreground pl-1 mt-1">
                + {dayEvents.length - 3} več
              </div>
            )}
          </div>
          <div 
            className="flex-1 min-h-[16px]" 
            onClick={(e) => {
              e.stopPropagation();
              openCreateModal(day);
            }} 
          />
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
          <Button size="sm" className="rounded-full gap-2" onClick={() => openCreateModal(selectedDate)}>
            <Plus className="w-4 h-4" />
            Dodaj
          </Button>
        </div>

        {eventsForSelectedDay.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 bg-muted/20">
            <p className="text-muted-foreground italic">Ni opomnikov za ta dan.</p>
          </Card>
        ) : (
          eventsForSelectedDay.map((event) => {
            const catColor = event.category?.color || '#6495ED';
            return (
              <Card key={event.id} className="p-4 border-none shadow-sm" style={{ borderLeft: `4px solid ${catColor}` }}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-bold text-foreground text-lg">{event.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px] py-0 h-5 gap-1 font-bold uppercase tracking-wider border-none" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
                          {event.category?.name || "Opomnik"}
                        </Badge>
                        {event.category?.visibility_level === 'parents' ? (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 gap-1 bg-purple-50 text-purple-600 border-purple-100">
                            <Lock className="w-2.5 h-2.5" /> Starši
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 gap-1 bg-green-50 text-green-600 border-green-100">
                            <Eye className="w-2.5 h-2.5" /> Vsi
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {event.is_all_day 
                          ? "Celodnevni dogodek" 
                          : `${format(parseISO(event.start_time), "HH:mm")} — ${format(parseISO(event.end_time), "HH:mm")}`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
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

      <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nov opomnik</DialogTitle>
            <DialogDescription>
              Dodajte nov dogodek ali opomnik na izbrani dan ({format(selectedDate, "d. MMMM yyyy", { locale: sl })}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateReminder} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Naziv opomnika</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kaj se dogaja?" required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="all-day-cal" 
                checked={isAllDay} 
                onCheckedChange={(checked) => {
                  setIsAllDay(checked === true);
                  if (checked) {
                    setStartDate(format(new Date(startDate), "yyyy-MM-dd"));
                    setEndDate(format(new Date(endDate), "yyyy-MM-dd"));
                  } else {
                    setStartDate(format(new Date(startDate), "yyyy-MM-dd'T'HH:mm"));
                    setEndDate(format(new Date(endDate), "yyyy-MM-dd'T'HH:mm"));
                  }
                }} 
              />
              <Label htmlFor="all-day-cal" className="font-medium cursor-pointer">Celotni dan</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Začetek (Od)</Label>
                <Input 
                  type={isAllDay ? "date" : "datetime-local"} 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Konec (Do)</Label>
                <Input 
                  type={isAllDay ? "date" : "datetime-local"} 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategorija</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Izberi kategorijo" /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-[#6495ED] hover:bg-[#5484DC]" disabled={isSubmitting}>
              Ustvari opomnik
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </>
  );
}