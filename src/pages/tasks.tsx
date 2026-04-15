import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Trash2, Calendar as CalendarIcon, Tag, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { SupabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sl } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [reminders, setReminders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reminder Form
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [endDate, setEndDate] = useState(format(new Date(new Date().getTime() + 3600000), "yyyy-MM-dd'T'HH:mm"));
  const [categoryId, setCategoryId] = useState<string>("");

  // Category Form
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#6495ED");
  const [catVisibility, setCatVisibility] = useState("all");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.family_id) {
      loadData();
    }
  }, [status, session, router]);

  const loadData = async () => {
    setLoading(true);
    const familyId = session?.user?.family_id as string;
    const [fetchedReminders, fetchedCategories] = await Promise.all([
      SupabaseService.getReminders(familyId),
      SupabaseService.getCategories(familyId),
    ]);
    if (fetchedReminders) setReminders(fetchedReminders);
    if (fetchedCategories) setCategories(fetchedCategories);
    setLoading(false);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !session?.user) return;
    setIsSubmitting(true);
    const result = await SupabaseService.createReminder({
      title,
      start_time: new Date(startDate).toISOString(),
      end_time: new Date(endDate).toISOString(),
      category_id: categoryId || null,
      family_id: session.user.family_id as string,
      creator_id: session.user.id,
      completed: false
    });
    if (result) {
      toast({ title: "Opomnik dodan", description: "Vaš novi opomnik je bil uspešno shranjen." });
      setIsReminderOpen(false);
      setTitle("");
      loadData();
    }
    setIsSubmitting(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !session?.user) return;
    setIsSubmitting(true);
    const result = await SupabaseService.createCategory({
      name: catName,
      color: catColor,
      visibility_level: catVisibility as any,
      family_id: session.user.family_id as string
    });
    if (result) {
      toast({ title: "Kategorija dodana", description: "Nova kategorija je pripravljena." });
      setIsCategoryOpen(false);
      setCatName("");
      loadData();
    }
    setIsSubmitting(false);
  };

  const handleToggleComplete = async (id: string, current: boolean) => {
    const success = await SupabaseService.updateReminder(id, { completed: !current });
    if (success) setReminders(reminders.map(r => r.id === id ? { ...r, completed: !current } : r));
  };

  const handleDeleteReminder = async (id: string) => {
    if (await SupabaseService.deleteReminder(id)) {
      setReminders(reminders.filter(r => r.id !== id));
      toast({ title: "Izbrisano", description: "Opomnik je bil odstranjen." });
    }
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Opomniki - FamilySync" />
      <div className="min-h-screen pb-32 bg-[#F9F8F6]">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] px-4 py-6">
          <div className="container max-w-2xl flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#333]">Opomniki</h1>
            <div className="flex gap-2">
              <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-[#6495ED] text-[#6495ED] hover:bg-[#6495ED]/10">
                    <Tag className="w-4 h-4 mr-2" /> Kategorije
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova kategorija</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateCategory} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Naziv kategorije</Label>
                      <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Npr. Šola, Treningi..." required />
                    </div>
                    <div className="space-y-2">
                      <Label>Barva kategorije</Label>
                      <div className="flex gap-2 flex-wrap">
                        {["#6495ED", "#FF6B6B", "#4ECDC4", "#FFD93D", "#9B59B6", "#2ECC71"].map(color => (
                          <button
                            key={color}
                            type="button"
                            className={cn("w-10 h-10 rounded-full border-2 transition-all", catColor === color ? "border-black scale-110" : "border-transparent")}
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
                    <Button type="submit" className="w-full bg-[#6495ED] hover:bg-[#5484DC]" disabled={isSubmitting}>Shrani kategorijo</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full bg-[#6495ED] hover:bg-[#5484DC]">
                    <Plus className="w-4 h-4 mr-2" /> Dodaj
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nov opomnik</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateReminder} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Naziv opomnika</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kaj se dogaja?" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Začetek (Od)</Label>
                        <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Konec (Do)</Label>
                        <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Kategorija</Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger><SelectValue placeholder="Izberi kategorijo" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-[#6495ED] hover:bg-[#5484DC]" disabled={isSubmitting}>Ustvari opomnik</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="container max-w-2xl mt-8 px-4">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-white rounded-full shadow-sm border border-[#F0F0F0] h-12">
              <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-[#6495ED] data-[state=active]:text-white">Aktivni ({activeReminders.length})</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full data-[state=active]:bg-[#6495ED] data-[state=active]:text-white">Opravljeni ({completedReminders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {activeReminders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#DDD]">
                  <CheckCircle2 className="w-16 h-16 text-[#DDD] mx-auto mb-4" />
                  <p className="text-[#999] font-medium">Trenutno nimate nobenih opomnikov.</p>
                </div>
              ) : (
                activeReminders.map(r => <ReminderCard key={r.id} reminder={r} onToggle={handleToggleComplete} onDelete={handleDeleteReminder} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedReminders.map(r => <ReminderCard key={r.id} reminder={r} onToggle={handleToggleComplete} onDelete={handleDeleteReminder} />)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

function ReminderCard({ reminder, onToggle, onDelete }: { reminder: any, onToggle: (id: string, s: boolean) => void, onDelete: (id: string) => void }) {
  const catColor = reminder.category?.color || "#DDD";
  
  return (
    <Card className={cn("p-5 rounded-[1.5rem] border-none shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-all", reminder.completed ? "opacity-60 grayscale" : "bg-white")}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={reminder.completed}
          onCheckedChange={() => onToggle(reminder.id, reminder.completed)}
          className="mt-1 w-6 h-6 rounded-full border-2 border-[#6495ED] data-[state=checked]:bg-[#6495ED]"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn("text-lg font-bold text-[#333]", reminder.completed && "line-through")}>{reminder.title}</h3>
            {reminder.category && (
              <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-widest border-none px-2" style={{ backgroundColor: `${catColor}20`, color: catColor }}>
                {reminder.category.name}
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-[#888] font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(reminder.start_time), "d. MMM 'ob' HH:mm", { locale: sl })} — {format(new Date(reminder.end_time), "HH:mm", { locale: sl })}</span>
            </div>
            {reminder.category?.visibility_level === 'parents' && (
              <div className="flex items-center gap-1 text-[10px] text-[#9333EA] font-bold uppercase">
                <EyeOff className="w-3 h-3" /> Samo starši
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-[#DDD] hover:text-destructive" onClick={() => onDelete(reminder.id)}>
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
}