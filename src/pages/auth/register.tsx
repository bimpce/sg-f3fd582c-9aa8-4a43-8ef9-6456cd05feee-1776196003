import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { createFamily, joinFamily } from "@/services/authService";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Create Family state
  const [familyName, setFamilyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Join Family state
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [familyCode, setFamilyCode] = useState("");

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await createFamily(familyName, adminEmail, adminPassword, adminName);
      setSuccess(`Družina "${result.family.name}" je bila ustvarjena! Vaša družinska koda: ${result.inviteCode}. Uporabite jo za povabilo članov. Preusmerjam na prijavo...`);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Prišlo je do napake pri ustvarjanju družine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await joinFamily(familyCode, joinEmail, joinPassword, joinName);
      setSuccess("Uspešno ste se registrirali! Preusmerjam na prijavo...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Prišlo je do napake pri pridruževanju družini.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Registracija - FamilySync" description="Ustvarite nov družinski račun ali se pridružite obstoječi družini" />
      
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 transition-colors duration-300">
        <Card className="w-full max-w-lg p-2 sm:p-6 bg-background neu-flat border-transparent rounded-[2rem]">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-[1.25rem] bg-background neu-flat flex items-center justify-center border-4 border-background">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold pt-2 text-foreground">Pridružite se FamilySync</CardTitle>
            <CardDescription className="text-muted-foreground">Ustvarite novo družino ali se pridružite obstoječi</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-background neu-pressed rounded-xl p-1 h-14 border-transparent">
                <TabsTrigger value="create" className="gap-2 rounded-lg data-[state=active]:neu-flat data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">Ustvari</span>
                </TabsTrigger>
                <TabsTrigger value="join" className="gap-2 rounded-lg data-[state=active]:neu-flat data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold">Pridruži se</span>
                </TabsTrigger>
              </TabsList>

              {(error || success) && (
                <Alert variant={error ? "destructive" : "default"} className={cn("mb-6 neu-pressed border-none", error ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
                  <AlertDescription className="font-medium">{error || success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="create">
                <form onSubmit={handleCreateFamily} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="family-name" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Ime družine</Label>
                    <Input
                      id="family-name"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary"
                      placeholder="Družina Novak"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-name" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Vaše ime</Label>
                    <Input
                      id="admin-name"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary"
                      placeholder="Ana Novak"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary"
                      placeholder="ana@primer.si"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Geslo</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-xl h-12 font-bold text-md mt-4" disabled={isLoading}>
                    {isLoading ? "Ustvarjanje..." : "Ustvari družino"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="join">
                <form onSubmit={handleJoinFamily} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="join-name" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Vaše ime</Label>
                    <Input
                      id="join-name"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary"
                      placeholder="Marko Novak"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-email" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Email</Label>
                    <Input
                      id="join-email"
                      type="email"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary"
                      placeholder="marko@primer.si"
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-password" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Geslo</Label>
                    <Input
                      id="join-password"
                      type="password"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary"
                      placeholder="••••••••"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family-code" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Družinska koda</Label>
                    <Input
                      id="family-code"
                      className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary uppercase font-mono tracking-widest text-center text-lg"
                      placeholder="FAM123"
                      value={familyCode}
                      onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                      required
                      disabled={isLoading}
                      maxLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-xl h-12 font-bold text-md mt-4" disabled={isLoading}>
                    {isLoading ? "Pridružujem..." : "Pridruži se družini"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-center pt-2">
            <p className="text-sm text-center text-muted-foreground font-medium">
              Že imate račun?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors font-bold underline decoration-2 underline-offset-4">
                Prijavite se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}