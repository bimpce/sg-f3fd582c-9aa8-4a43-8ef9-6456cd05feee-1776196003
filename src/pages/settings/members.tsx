import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Shield, User as UserIcon, Settings2 } from "lucide-react";
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

  const isAdmin = session?.user?.role === "super_admin" || session?.user?.role === "parent";

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
          <div className="container max-w-2xl flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold">Člani družine</h1>
          </div>
        </div>

        <div className="container max-w-2xl mt-6 space-y-6">
          {members.map((member) => (
            <Card key={member.id} className="p-6 overflow-hidden border-border shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {member.name?.charAt(0) || member.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{member.name || "Brez imena"}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                
                <Select
                  defaultValue={member.role}
                  onValueChange={(val) => handleRoleChange(member.id, val)}
                  disabled={member.id === session?.user?.id} // Cannot change own role
                >
                  <SelectTrigger className="w-[130px] bg-muted/50">
                    <SelectValue placeholder="Vloga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super-Admin</SelectItem>
                    <SelectItem value="parent">Starš</SelectItem>
                    <SelectItem value="child">Otrok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Dovoljenja
                  </span>
                </div>
                
                <div className="grid gap-4">
                  {PERMISSIONS_LIST.map((perm) => {
                    const isGranted = member.permissions?.find(
                      (p: any) => p.permission_name === perm.key
                    )?.granted || false;

                    return (
                      <div key={perm.key} className="flex items-center justify-between py-1">
                        <Label htmlFor={`${member.id}-${perm.key}`} className="flex-1 cursor-pointer font-medium">
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
            </Card>
          ))}

          {members.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Ni najdenih članov.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </>
  );
}