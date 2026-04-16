import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Settings, SlidersHorizontal, MoveHorizontal } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { sl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SupabaseService } from "@/services/supabaseService";

interface Event {
  id: string;
  title: string;
  time: string;
  member: string;
  date: Date;
  type: "event" | "task";
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated" && mounted) {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.family_id) {
      fetchReminders();
    }
  }, [status, router, mounted, session]);

  const fetchReminders = async () => {
    setLoading(true);
    const data = await SupabaseService.getReminders(session?.user?.family_id as string);
    if (data) setReminders(data);
    setLoading(false);
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  const userName = session.user?.name || "Uporabnik";
  const userRole = session.user?.role || "child";
  const familyName = session.user?.family_name || "Družina";

  const remindersForSelectedDay = selectedDate 
    ? reminders.filter(r => isSameDay(parseISO(r.start_time), selectedDate))
    : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <>
      <SEO title="FamilySync - Domov" description="Družinski koledar in opomniki" />

      <div className="min-h-screen bg-[#F9F8F6] pb-32 pt-10 px-4">
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Header po sliki */}
          <Card className="p-6 rounded-[2rem] border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#6495ED] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#333] flex items-center gap-2">
                    Pozdravljena, {userName}! 👋
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-[#F3E8FF] text-[#9333EA] hover:bg-[#F3E8FF] font-semibold px-3 py-0.5 rounded-full text-xs uppercase tracking-wider">
                      {userRole === "super_admin" ? "Super-Admin" : userRole === "parent" ? "Starš" : "Otrok"}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">
                      {familyName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Koledar v slovenščini */}
          <Card className="p-4 rounded-[1.5rem] border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white overflow-hidden">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={sl}
              className="w-full flex justify-center p-0"
              classNames={{
                months: "w-full",
                month: "w-full space-y-4",
                caption: "flex justify-center pt-1 relative items-center mb-4 hidden", // Skrijemo default caption ker želimo custom
                table: "w-full border-collapse",
                head_row: "flex w-full mb-2",
                head_cell: "text-muted-foreground flex-1 font-bold text-[10px] uppercase tracking-widest text-center",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative p-0 text-center text-sm flex-1 focus-within:relative focus-within:z-20",
                  "[&:has([aria-selected])]:bg-transparent"
                ),
                day: cn(
                  "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-lg mx-auto flex items-center justify-center hover:bg-secondary transition-all"
                ),
                day_selected: "bg-[#B9D1F0] text-[#333] hover:bg-[#B9D1F0] hover:text-[#333] focus:bg-[#B9D1F0] focus:text-[#333] font-bold",
                day_today: "bg-transparent text-primary font-bold border-b-2 border-primary rounded-none",
                day_outside: "text-muted-foreground/30 opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
              }}
            />
          </Card>

          {/* Navodilo: S klikom na datum se spodaj odprejo opomniki... */}
          <div className="space-y-4">
            {remindersForSelectedDay.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                  Opomniki za {format(selectedDate!, "d. MMMM", { locale: sl })}
                </h3>
                {remindersForSelectedDay.map((reminder) => (
                  <Card key={reminder.id} className="p-6 rounded-[1.5rem] bg-[#EBF3FF] border-[#D1E3FF] shadow-none flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#6495ED] uppercase tracking-widest mb-1" style={{ color: reminder.category?.color }}>
                        {reminder.category?.name || "OPOMNIK"}
                      </p>
                      <h3 className={cn("text-lg font-bold text-[#333] mb-1", reminder.completed && "line-through opacity-50")}>
                        {reminder.title}
                      </h3>
                      <p className="text-sm text-[#777] font-medium">
                        {reminder.is_all_day ? "Celodnevni dogodek" : `Ob ${format(parseISO(reminder.start_time), "HH:mm")}`}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm italic">Ni načrtovanih opomnikov.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}