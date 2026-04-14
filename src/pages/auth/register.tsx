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

export default function RegisterPage() {
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

    // MOCK: Simulate API call
    setTimeout(() => {
      setSuccess(`Družina "${familyName}" je bila ustvarjena! Vaša družinska koda: FAM123. Uporabite jo za povabilo članov.`);
      setIsLoading(false);
    }, 1000);
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // MOCK: Simulate API call
    setTimeout(() => {
      if (familyCode.toUpperCase() === "FAM123") {
        setSuccess("Uspešno ste se pridružili družini! Preusmerjam na prijavo...");
        setTimeout(() => window.location.href = "/auth/login", 2000);
      } else {
        setError("Neveljavna družinska koda. Preverite kodo in poskusite ponovno.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <SEO title="Registracija - FamilySync" description="Ustvarite nov družinski račun ali se pridružite obstoječi družini" />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Pridružite se FamilySync</CardTitle>
            <CardDescription>Ustvarite novo družino ali se pridružite obstoječi</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create" className="gap-2">
                  <Users className="w-4 h-4" />
                  Ustvari družino
                </TabsTrigger>
                <TabsTrigger value="join" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Pridruži se
                </TabsTrigger>
              </TabsList>

              {(error || success) && (
                <Alert variant={error ? "destructive" : "default"} className="mb-4">
                  <AlertDescription>{error || success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="create">
                <form onSubmit={handleCreateFamily} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="family-name">Ime družine</Label>
                    <Input
                      id="family-name"
                      placeholder="Družina Novak"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Vaše ime</Label>
                    <Input
                      id="admin-name"
                      placeholder="Ana Novak"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="ana@primer.si"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Geslo</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Ustvarjanje..." : "Ustvari družino"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="join">
                <form onSubmit={handleJoinFamily} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="join-name">Vaše ime</Label>
                    <Input
                      id="join-name"
                      placeholder="Marko Novak"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-email">Email</Label>
                    <Input
                      id="join-email"
                      type="email"
                      placeholder="marko@primer.si"
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-password">Geslo</Label>
                    <Input
                      id="join-password"
                      type="password"
                      placeholder="••••••••"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family-code">Družinska koda</Label>
                    <Input
                      id="family-code"
                      placeholder="FAM123"
                      value={familyCode}
                      onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                      required
                      disabled={isLoading}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Vnesite 6-mestno kodo, ki ste jo prejeli od upravitelja družine
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Pridružujem..." : "Pridruži se družini"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-center text-muted-foreground">
              Že imate račun?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Prijavite se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}