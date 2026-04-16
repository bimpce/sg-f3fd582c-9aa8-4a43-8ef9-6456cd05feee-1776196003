import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { SupabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#6495ED");
  const [catVisibility, setCatVisibility] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = ["#6495ED", "#FF6B6B", "#4ECDC4", "#FFD93D", "#9B59B6", "#2ECC71", "#FF9F43", "#A8E6CF", "#34495E"];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.family_id) {
      loadCategories();
    }
  }, [status, session, router]);

  const loadCategories = async () => {
    setLoading(true);
    const fetchedCategories = await SupabaseService.getCategories(session?.user?.family_id as string);
    if (fetchedCategories) setCategories(fetchedCategories);
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setCatName("");
    setCatColor("#6495ED");
    setCatVisibility("all");
    setIsOpen(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditingId(category.id);
    setCatName(category.name);
    setCatColor(category.color);
    setCatVisibility(category.visibility_level || "all");
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !session?.user) return;
    
    const userRole = (session.user as any).role;
    if (userRole !== 'super_admin' && userRole !== 'parent') {
      toast({ 
        title: "Dostop zavrnjen", 
        description: "Samo starši lahko upravljajo kategorije.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const familyId = (session.user as any).family_id;
      const categoryData = {
        name: catName,
        color: catColor,
        visibility_level: catVisibility as any,
        family_id: familyId
      };

      let result;
      if (editingId) {
        result = await SupabaseService.updateCategory(editingId, categoryData);
      } else {
        result = await SupabaseService.createCategory(categoryData);
      }

      if (result) {
        toast({ 
          title: editingId ? "Kategorija posodobljena" : "Kategorija dodana", 
          description: editingId ? "Spremembe so shranjene." : "Nova kategorija je pripravljena." 
        });
        setIsOpen(false);
        loadCategories();
      } else {
        toast({ title: "Napaka", description: "Shranjevanje ni uspelo. Preverite pravice.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Napaka", description: "Prišlo je do nepričakovane napake.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const userRole = (session?.user as any)?.role;
    if (userRole !== 'super_admin' && userRole !== 'parent') {
      toast({ title: "Dostop zavrnjen", description: "Samo starši lahko brišejo kategorije.", variant: "destructive" });
      return;
    }

    if (confirm("Ali ste prepričani, da želite izbrisati to kategorijo?")) {
      const success = await SupabaseService.deleteCategory(id);
      if (success) {
        setCategories(categories.filter(c => c.id !== id));
        toast({ title: "Izbrisano", description: "Kategorija je bila odstranjena." });
      } else {
        toast({ title: "Napaka", description: "Kategorije ni bilo mogoče izbrisati.", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Kategorije - FamilySync" />
      <div className="min-h-screen pb-32 bg-[#F9F8F6]">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] px-4 py-6">
          <div className="container max-w-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push('/reminders')} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-[#333]">Kategorije</h1>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full bg-[#6495ED] hover:bg-[#5484DC]" onClick={handleOpenCreate}>
                  <Plus className="w-4 h-4 mr-1" /> Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Uredi kategorijo" : "Nova kategorija"}</DialogTitle>
                  <DialogDescription>
                    Določite ime, barvo in kdo lahko vidi opomnike v tej kategoriji.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Naziv kategorije</Label>
                    <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Npr. Šola, Treningi..." required />
                  </div>
                  <div className="space-y-2">
                    <Label>Barva kategorije</Label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={cn("w-10 h-10 rounded-full border-2 transition-all", catColor === color ? "border-black scale-110" : "border-transparent shadow-sm")}
                          style={{ backgroundColor: color }}
                          onClick={() => setCatColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kdo lahko vidi?</Label>
                    <Select value={catVisibility} onValueChange={setCatVisibility}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Vsi družinski člani</SelectItem>
                        <SelectItem value="parents">Samo starši</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-[#6495ED] hover:bg-[#5484DC]" disabled={isSubmitting}>
                    {isSubmitting ? "Shranjujem..." : "Shrani kategorijo"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="container max-w-2xl mt-8 px-4 space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#DDD]">
              <p className="text-[#999] font-medium">Nimate še nobene kategorije.</p>
            </div>
          ) : (
            categories.map(category => (
              <Card key={category.id} className="p-4 rounded-2xl border-none shadow-[0_4px_15px_rgba(0,0,0,0.04)] bg-white flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-white" style={{ backgroundColor: category.color }}>
                    {category.visibility_level === 'parents' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#333] text-lg">{category.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {category.visibility_level === 'parents' ? 'Samo starši' : 'Vsi člani'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="text-[#6495ED] hover:text-[#5484DC] hover:bg-[#6495ED]/10" onClick={() => handleOpenEdit(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}