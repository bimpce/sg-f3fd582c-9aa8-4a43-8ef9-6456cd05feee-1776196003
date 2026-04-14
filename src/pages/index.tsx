import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { AddButton } from "@/components/AddButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Eye, Lock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  time: string;
  member: string;
  color: string;
  visibility: "all" | "parents";
}

export default function HomePage() {
  const today = new Date();
  const monthName = today.toLocaleDateString("sl-SI", { month: "long", year: "numeric" });

  const demoEvents: Event[] = [
    {
      id: "1",
      title: "Obisk pri pediatru",
      time: "10:00",
      member: "Maja",
      color: "family-pink",
      visibility: "parents",
    },
    {
      id: "2",
      title: "Nogometna tekma",
      time: "16:30",
      member: "Luka",
      color: "family-blue",
      visibility: "all",
    },
    {
      id: "3",
      title: "Družinski piknik",
      time: "12:00",
      member: "Mama",
      color: "family-green",
      visibility: "all",
    },
  ];

  return (
    <>
      <SEO
        title="FamilySync - Družinski Koledar"
        description="Organizirajte družinske dogodke in naloge z enostavnim sodelovalnim koledarjem."
      />

      <div className="min-h-screen pb-24 pt-6">
        <div className="container max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pozdravljena, Ana! 👋
            </h1>
            <p className="text-muted-foreground">
              Danes imaš 3 dogodke
            </p>
          </div>

          {/* Mini koledar pregled */}
          <Card className="p-6 mb-6 bg-card border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                Danes
              </Badge>
            </div>

            {/* Današnji dogodki */}
            <div className="space-y-3">
              {demoEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border-l-4 bg-${event.color}/20 border-${event.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        {event.visibility === "parents" ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.time} • {event.member}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Statistika */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-4 text-center bg-card border-border">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground mt-1">Dogodkov<br/>ta teden</p>
            </Card>
            <Card className="p-4 text-center bg-card border-border">
              <p className="text-2xl font-bold text-accent">5</p>
              <p className="text-xs text-muted-foreground mt-1">Aktivnih<br/>nalog</p>
            </Card>
            <Card className="p-4 text-center bg-card border-border">
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-xs text-muted-foreground mt-1">Družinskih<br/>članov</p>
            </Card>
          </div>

          {/* Naslednji dogodek highlight */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Naslednji dogodek
            </p>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Obisk pri pediatru
            </h3>
            <p className="text-sm text-muted-foreground">
              Danes ob 10:00 • Maja
            </p>
          </Card>
        </div>
      </div>

      <AddButton onClick={() => console.log("Dodaj dogodek/nalogo")} />
      <BottomNav />
    </>
  );
}