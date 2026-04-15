import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Save } from "lucide-react";
import { SupabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.name) {
      setName(session.user.name);
    }
  }, [status, session, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    const updated = await SupabaseService.updateProfile(session.user.id, { name });
    
    if (updated) {
      await update({ name }); // Update NextAuth session
      toast({
        title: "Profil posodobljen",
        description: "Vaše spremembe so bile uspešno shranjene.",
      });
    } else {
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri shranjevanju.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const roleBadgeColor = {
    super_admin: "bg-red-100 text-red-800 border-red-200",
    parent: "bg-blue-100 text-blue-800 border-blue-200",
    child: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <>
      <SEO title="Moj Profil - FamilySync" />
      
      <div className="min-h-screen pb-24 bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
          <div className="container max-w-2xl flex items-center justify-between">
            <h1 className="text-xl font-bold">Moj Profil</h1>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="container max-w-2xl mt-6 space-y-6">
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-8 border-b border-border">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{session?.user?.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">{session?.user?.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Badge variant="outline" className={roleBadgeColor[(session?.user?.role as keyof typeof roleBadgeColor)] || ""}>
                      {session?.user?.role === "super_admin" ? "Super-Admin" : session?.user?.role === "parent" ? "Starš" : "Otrok"}
                    </Badge>
                    <Badge variant="secondary">{session?.user?.family_name || "Družina"}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Prikazano ime</Label>
                  <div className="flex gap-3">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Vaše ime"
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || name === session?.user?.name}>
                      {isLoading ? "Shranjevanje..." : <><Save className="w-4 h-4 mr-2" /> Shrani</>}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </>
  );
}