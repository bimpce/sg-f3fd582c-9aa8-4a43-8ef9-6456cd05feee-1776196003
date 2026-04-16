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
        // NextAuth včasih vrne generičen "CredentialsSignin", zato to preverimo
        const errMsg = result.error === "CredentialsSignin" 
          ? "Napačen email ali geslo." 
          : result.error;
        setError(errMsg);
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (err) {
      setError("Prišlo je do nepričakovane napake. Poskusite ponovno.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Prijava - FamilySync" description="Prijavite se v svoj družinski račun" />
      
      <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-300">
        <Card className="w-full max-w-md p-6 bg-background neu-flat border-transparent rounded-[2rem]">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-[1.25rem] bg-background neu-flat flex items-center justify-center border-4 border-background">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold pt-2 text-foreground">Dobrodošli nazaj</CardTitle>
            <CardDescription className="text-muted-foreground">Prijavite se v svoj FamilySync račun</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="neu-pressed border-none bg-destructive/10 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary focus-visible:ring-offset-2"
                  placeholder="ime@primer.si"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-1">Geslo</Label>
                <Input
                  id="password"
                  type="password"
                  className="neu-pressed border-transparent bg-background rounded-xl h-12 px-4 focus-visible:ring-primary focus-visible:ring-offset-2"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="bg-background neu-pressed rounded-xl p-4 text-sm space-y-1.5 mt-6 border-transparent">
                <p className="font-bold text-muted-foreground text-xs uppercase tracking-widest mb-2">Demo računi:</p>
                <p className="text-xs text-foreground"><strong>Super-Admin:</strong> <span className="text-primary">super@family.com</span> / demo123</p>
                <p className="text-xs text-foreground"><strong>Starš:</strong> <span className="text-primary">parent@family.com</span> / demo123</p>
                <p className="text-xs text-foreground"><strong>Otrok:</strong> <span className="text-primary">child@family.com</span> / demo123</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button type="submit" className="w-full rounded-xl h-12 font-bold text-md" disabled={isLoading}>
                {isLoading ? "Prijavljanje..." : "Prijava"}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground font-medium mt-2">
                Nimate družinskega računa?{" "}
                <Link href="/auth/register" className="text-primary hover:text-primary/80 transition-colors font-bold underline decoration-2 underline-offset-4">
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