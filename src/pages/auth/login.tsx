import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Napačen email ali geslo");
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (err) {
      setError("Prišlo je do napake. Poskusite ponovno.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Prijava - FamilySync" description="Prijavite se v svoj družinski račun" />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Dobrodošli nazaj</CardTitle>
            <CardDescription>Prijavite se v svoj FamilySync račun</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ime@primer.si"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Geslo</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-muted-foreground">Demo računi:</p>
                <p className="text-xs"><strong>Super-Admin:</strong> super@family.com / demo123</p>
                <p className="text-xs"><strong>Starš:</strong> parent@family.com / demo123</p>
                <p className="text-xs"><strong>Otrok:</strong> child@family.com / demo123</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Prijavljanje..." : "Prijava"}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Nimate družinskega računa?{" "}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Registrirajte se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}