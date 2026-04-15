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
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Shield, User as UserIcon, Plus, Pencil, Trash2, Key } from "lucide-react";
import { SupabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

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
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dodajanje novega člana
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: "child" });
  
  // Urejanje člana
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", password: "" });
  
  // Brisanje člana
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      const response = await fetch("/api/members/list");
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error loading members:", error);
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
      if (!response.ok) throw new Error(data.error);
      toast({ title: "Član dodan!", description: `${newMember.name} je bil uspešno dodan.` });
      setIsAddDialogOpen(false);
      setNewMember({ name: "", email: "", password: "", role: "child" });
      loadMembers();
    } catch (error: any) {
      toast({ title: "Napaka", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/members/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: editingMember.id,
          ...editForm
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast({ title: "Posodobljeno!", description: "Podatki o članu so bili shranjeni." });
      setIsEditDialogOpen(false);
      loadMembers();
    } catch (error: any) {
      toast({ title: "Napaka", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/members/delete?memberId=${memberToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast({ title: "Izbrisano", description: "Član je bil odstranjen iz družine." });
      setIsDeleteDialogOpen(false);
      loadMembers();
    } catch (error: any) {
      toast({ title: "Napaka", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionToggle = async (memberId: string, permissionName: string, currentlyGranted: boolean) => {
    const success = await SupabaseService.setPermission(
      memberId,
      session?.user?.family_id as string,
      permissionName,
      !currentlyGranted
    );
    if (success) loadMembers();
  };

  const openEditDialog = (member: any) => {
    setEditingMember(member);
    setEditForm({ name: member.name || member.full_name || "", role: member.role || "child", password: "" });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: any) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj novega člana</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateMember} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-name">Ime</Label>
                      <Input id="add-name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-email">E-pošta</Label>
                      <Input id="add-email" type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-password">Geslo</Label>
                      <Input id="add-password" type="password" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} required minLength={6} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-role">Vloga</Label>
                      <Select value={newMember.role} onValueChange={(val) => setNewMember({ ...newMember, role: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parent">Starš</SelectItem>
                          <SelectItem value="child">Otrok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>Ustvari račun</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="container max-w-2xl mt-6 space-y-6">
          {members.map((member) => (
            <Card key={member.id} className="p-4 overflow-hidden">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name?.charAt(0).toUpperCase() || <UserIcon className="w-6 h-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name || "Neznano ime"}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    {member.role === "super_admin" ? "Super-Admin" : member.role === "parent" ? "Starš" : "Otrok"}
                  </div>
                  {isSuperAdmin && member.id !== session?.user?.id && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(member)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {isSuperAdmin && member.id !== session?.user?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Pravice člana
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERMISSIONS_LIST.map((perm) => {
                      const isGranted = member.permissions?.some((p: any) => p.permission_name === perm.key && p.granted);
                      return (
                        <div key={perm.key} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                          <Label htmlFor={`${member.id}-${perm.key}`} className="text-xs font-normal cursor-pointer">{perm.label}</Label>
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
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uredi člana</DialogTitle>
            <DialogDescription>Posodobite podatke za uporabnika {editingMember?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMember} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ime</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Vloga</Label>
              <Select value={editForm.role} onValueChange={(val) => setEditForm({ ...editForm, role: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super-Admin</SelectItem>
                  <SelectItem value="parent">Starš</SelectItem>
                  <SelectItem value="child">Otrok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-2 border-t border-border mt-4">
              <Label htmlFor="edit-password" title="Pusti prazno, če ne želite spremeniti">
                Novo geslo <span className="text-xs font-normal text-muted-foreground">(opcijsko)</span>
              </Label>
              <div className="relative">
                <Input id="edit-password" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Vpišite novo geslo" minLength={6} />
                <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Prekliči</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Shranjevanje..." : "Shrani spremembe"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ali ste prepričani?</AlertDialogTitle>
            <AlertDialogDescription>
              Uporabnik <strong>{memberToDelete?.name || memberToDelete?.email}</strong> bo trajno odstranjen iz vaše družine in ne bo imel več dostopa do aplikacije.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Prekliči</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Izbriši člana
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </>
  );
}