import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Settings, SlidersHorizontal, MoveHorizontal } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { sl } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  const [viewingSpecificDate, setViewingSpecificDate] = useState(false);

  // Demo podatki - v naslednjem koraku povežemo s Supabase
  const demoEvents: Event[] = [
    {
      id: "1",
      title: "Obisk pri pediatru",
      time: "10:00",
      member: "Maja",
      date: new Date(),
      type: "event",
    },
    {
      id: "2",
      title: "Trening nogometa",
      time: "17:00",
      member: "Luka",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      type: "event",
    },
  ];

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated" && mounted) {
      router.push("/auth/login");
    }
  }, [status, router, mounted]);

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

  const nextEvent = demoEvents[0]; // Zaenkrat vzamemo prvi dogodek
  const eventsForSelectedDay = selectedDate 
    ? demoEvents.filter(e => isSameDay(e.date, selectedDate))
    : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Preverimo če obstajajo opomniki za ta dan
      const hasEvents = demoEvents.some(e => isSameDay(e.date, date));
      setViewingSpecificDate(hasEvents);
    } else {
      setViewingSpecificDate(false);
    }
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
              <div className="flex gap-2">
                <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
                <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
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
            {viewingSpecificDate && eventsForSelectedDay.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                  Opomniki za {format(selectedDate!, "d. MMMM", { locale: sl })}
                </h3>
                {eventsForSelectedDay.map((event) => (
                  <Card key={event.id} className="p-6 rounded-[1.5rem] bg-[#EBF3FF] border-[#D1E3FF] shadow-none flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#6495ED] uppercase tracking-widest mb-1">
                        DOGODEK
                      </p>
                      <h3 className="text-lg font-bold text-[#333] mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-[#777] font-medium">
                        Danes ob {event.time} • {event.member}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Privzet prikaz: Naslednji dogodek */
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                  Naslednji dogodek
                </h3>
                <Card className="p-6 rounded-[2rem] bg-[#EBF3FF] border-[#D1E3FF] border shadow-none relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-[#6495ED] uppercase tracking-widest mb-1">
                      NASLEDNJI DOGODEK
                    </p>
                    <h3 className="text-lg font-bold text-[#333] mb-1">
                      {nextEvent.title}
                    </h3>
                    <p className="text-sm text-[#777] font-medium">
                      {isToday(nextEvent.date) ? "Danes" : format(nextEvent.date, "eeee", { locale: sl })} ob {nextEvent.time} • {nextEvent.member}
                    </p>
                  </div>
                  {/* Ikona s slike */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 rounded-full border-2 border-[#6495ED] flex items-center justify-center text-[#6495ED] bg-white shadow-sm">
                      <MoveHorizontal className="w-6 h-6 rotate-45" />
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}