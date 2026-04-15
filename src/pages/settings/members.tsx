import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Shield, User as UserIcon, Settings2, Plus } from "lucide-react";
import { SupabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

type MemberWithPermissions = any; // We'll map this from service

const PERMISSIONS_LIST = [
  { key: "CAN_CREATE_EVENT", label: "Dodajanje dogodkov" },
  { key: "CAN_EDIT_OTHERS_EVENTS", label: "Urejanje tujih dogodkov" },
  { key: "CAN_SEE_PRIVATE", label: "Vpogled v zasebno" },
  { key: "CAN_DELETE", label: "Brisanje vsebin" },
  { key: "CAN_INVITE", label: "Vabljenje članov" },
];

export default function MembersSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  // Dodajanje novega člana
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    role: "child"
  });

  const isAdmin = session?.user?.role === "super_admin" || session?.user?.role === "parent";
  const isSuperAdmin = session?.user?.role === "super_admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && !isAdmin) {
      router.push("/");
    } else if (status === "authenticated" && session?.user?.family_id) {
      loadMembers();
    }
  }, [status, session, isAdmin, router]);

  const loadMembers = async () => {
    setLoading(true);
    const data = await SupabaseService.getFamilyMembersWithPermissions(session?.user?.family_id as string);
    if (data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/members/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Napaka pri dodajanju člana.");
      }

      toast({
        title: "Član dodan!",
        description: `${newMember.name} je bil uspešno dodan v družino.`,
      });
      
      setIsAddDialogOpen(false);
      setNewMember({ name: "", email: "", password: "", role: "child" });
      loadMembers();
    } catch (error: any) {
      toast({
        title: "Napaka",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const success = await SupabaseService.updateMemberRole(memberId, newRole as any);
    if (success) {
      toast({
        title: "Vloga posodobljena",
        description: "Nova vloga je bila uspešno shranjena.",
      });
      loadMembers();
    }
  };

  const handlePermissionToggle = async (memberId: string, permissionName: string, currentlyGranted: boolean) => {
    const success = await SupabaseService.setPermission(
      memberId,
      session?.user?.family_id as string,
      permissionName,
      !currentlyGranted
    );
    
    if (success) {
      toast({
        title: "Pravice posodobljene",
        description: `${permissionName} status spremenjen.`,
      });
      loadMembers();
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Upravljanje članov - FamilySync" />
      
      <div className="min-h-screen pb-24 bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
          <div className="container max-w-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-xl font-bold">Člani družine</h1>
            </div>

            {isSuperAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Dodaj člana
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Dodaj novega družinskega člana</DialogTitle>
                    <DialogDescription className="hidden">
                      Izpolnite podatke za ustvarjanje novega družinskega člana.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateMember} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ime</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Npr. Ana"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-poštni naslov</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="ana@primer.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Geslo</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newMember.password}
                        onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                        placeholder="Vsaj 6 znakov"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Vloga</Label>
                      <Select 
                        value={newMember.role} 
                        onValueChange={(val) => setNewMember({ ...newMember, role: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Izberi vlogo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parent">Starš / Skrbnik</SelectItem>
                          <SelectItem value="child">Otrok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                      {isSubmitting ? "Ustvarjanje..." : "Ustvari račun"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="container max-w-2xl mt-6 space-y-6">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Ni najdenih članov.</p>
          ) : (
            members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || <UserIcon className="w-6 h-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{member.name || member.full_name || "Neznano ime"}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  
                  {isSuperAdmin && member.id !== session?.user?.id ? (
                    <Select 
                      value={member.role || "child"} 
                      onValueChange={(val) => handleRoleChange(member.id, val)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super-Admin</SelectItem>
                        <SelectItem value="parent">Starš</SelectItem>
                        <SelectItem value="child">Otrok</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                      {member.role === "super_admin" ? "Super-Admin" : member.role === "parent" ? "Starš" : "Otrok"}
                    </div>
                  )}
                </div>

                {isSuperAdmin && member.id !== session?.user?.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Dodatne pravice za člana
                    </h4>
                    <div className="space-y-3">
                      {PERMISSIONS_LIST.map((perm) => {
                        // Preverimo, če ima uporabnik to pravico
                        const isGranted = member.permissions?.some(
                          (p: any) => p.permission_name === perm.key && p.granted
                        ) || false;
                        
                        return (
                          <div key={perm.key} className="flex items-center justify-between">
                            <Label htmlFor={`${member.id}-${perm.key}`} className="text-sm font-normal cursor-pointer">
                              {perm.label}
                            </Label>
                            <Switch
                              id={`${member.id}-${perm.key}`}
                              checked={isGranted}
                              onCheckedChange={() => handlePermissionToggle(member.id, perm.key, isGranted)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}