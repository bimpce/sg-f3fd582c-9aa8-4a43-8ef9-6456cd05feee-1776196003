import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { AddButton } from "@/components/AddButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CheckSquare, Plus, Settings, Eye, Lock } from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  time: string;
  member: string;
  color: string;
  visibility: "all" | "parents";
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (status === "unauthenticated" && mounted) {
      router.push("/auth/login");
    }
  }, [status, router, mounted]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Nalaganje...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const today = new Date();
  const monthName = today.toLocaleDateString("sl-SI", { month: "long", year: "numeric" });
  const userName = session.user?.name || "Družinski član";
  const userRole = session.user?.role || "child";
  const familyName = session.user?.family_name || "Družina";

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

  const roleBadgeColor = {
    super_admin: "bg-purple-100 text-purple-800",
    parent: "bg-blue-100 text-blue-800",
    child: "bg-green-100 text-green-800",
  } as const;

  return (
    <>
      <SEO
        title="FamilySync - Doma"
        description="Družinski koledar in opomniki"
      />

      <div className="min-h-screen pb-24 pt-6 bg-background">
        <div className="container max-w-2xl">
          {/* Header z uporabniškim profilom */}
          <div className="mb-8">
            <Card className="p-6 bg-card border-border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    Pozdravljena, {userName}! 👋
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={roleBadgeColor[userRole as keyof typeof roleBadgeColor] || "bg-gray-100 text-gray-800"}>
                      {userRole === "super_admin" ? "Super-Admin" : userRole === "parent" ? "Starš" : "Otrok"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {familyName}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-card border-border hover:bg-accent/10"
              onClick={() => router.push("/calendar")}
            >
              <CalendarIcon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Koledar</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-card border-border hover:bg-accent/10"
              onClick={() => router.push("/tasks")}
            >
              <CheckSquare className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium">Naloge</span>
            </Button>
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