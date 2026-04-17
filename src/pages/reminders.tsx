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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Trash2, Calendar as CalendarIcon, Tag, Eye, EyeOff, CheckCircle2, Pencil, CalendarDays } from "lucide-react";
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
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
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

  const resetForm = () => {
    setEditingReminderId(null);
    setTitle("");
    setIsAllDay(false);
    setStartDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setEndDate(format(new Date(new Date().getTime() + 3600000), "yyyy-MM-dd'T'HH:mm"));
    setCategoryId("");
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminderId(reminder.id);
    setTitle(reminder.title);
    setIsAllDay(reminder.is_all_day || false);
    setCategoryId(reminder.category_id || "");
    
    if (reminder.is_all_day) {
      setStartDate(format(new Date(reminder.start_time), "yyyy-MM-dd"));
      setEndDate(format(new Date(reminder.end_time), "yyyy-MM-dd"));
    } else {
      setStartDate(format(new Date(reminder.start_time), "yyyy-MM-dd'T'HH:mm"));
      setEndDate(format(new Date(reminder.end_time), "yyyy-MM-dd'T'HH:mm"));
    }
    
    setIsReminderOpen(true);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !session?.user) return;
    setIsSubmitting(true);
    try {
      let startObj = new Date(startDate);
      let endObj = new Date(endDate);
      
      if (isAllDay) {
        // If it's just a date string (YYYY-MM-DD), make it start/end of day
        startObj = new Date(startDate);
        startObj.setHours(0, 0, 0, 0);
        
        endObj = new Date(endDate);
        endObj.setHours(23, 59, 59, 999);
      }

      const reminderData = {
        title,
        start_time: startObj.toISOString(),
        end_time: endObj.toISOString(),
        is_all_day: isAllDay,
        category_id: categoryId || null,
      };

      if (editingReminderId) {
        const result = await SupabaseService.updateReminder(editingReminderId, reminderData);
        if (result) {
          toast({ title: "Opomnik posodobljen", description: "Spremembe so bile uspešno shranjene." });
          setIsReminderOpen(false);
          resetForm();
          loadData();
        } else {
          toast({ title: "Napaka", description: "Opomnika ni bilo mogoče posodobiti. Preverite pravice.", variant: "destructive" });
        }
      } else {
        const result = await SupabaseService.createReminder({
          ...reminderData,
          family_id: session.user.family_id as string,
          creator_id: session.user.id,
          completed: false
        });
        if (result) {
          toast({ title: "Opomnik dodan", description: "Vaš novi opomnik je bil uspešno shranjen." });
          setIsReminderOpen(false);
          resetForm();
          loadData();
        } else {
          toast({ title: "Napaka", description: "Opomnika ni bilo mogoče shraniti. Preverite pravice.", variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: "Napaka", description: "Prišlo je do nepričakovane napake.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !session?.user) return;
    
    // Safety check for role - only parents and super_admins can create categories
    const userRole = (session.user as any).role;
    if (userRole !== 'super_admin' && userRole !== 'parent') {
      toast({ 
        title: "Dostop zavrnjen", 
        description: "Samo starši lahko ustvarjajo kategorije.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const familyId = (session.user as any).family_id;
      if (!familyId) {
        throw new Error("Družinski ID ni najden.");
      }

      const result = await SupabaseService.createCategory({
        name: catName,
        color: catColor,
        visibility_level: catVisibility as any,
        family_id: familyId
      });
      if (result) {
        toast({ title: "Kategorija dodana", description: "Nova kategorija je pripravljena." });
        setIsCategoryOpen(false);
        setCatName("");
        loadData();
      } else {
        toast({ title: "Napaka", description: "Kategorije ni bilo mogoče shraniti. Preverite pravice.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Napaka", description: "Prišlo je do nepričakovane napake.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Opomniki - FamilySync" />
      <div className="min-h-screen pb-32 bg-background transition-colors duration-300">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-6">
          <div className="container max-w-2xl flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Opomniki</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-primary text-primary hover:bg-primary/10"
                onClick={() => router.push('/categories')}
              >
                <Tag className="w-4 h-4 mr-2" /> Kategorije
              </Button>

              <Dialog open={isReminderOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsReminderOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90" onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" /> Dodaj
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingReminderId ? "Uredi opomnik" : "Nov opomnik"}</DialogTitle>
                    <DialogDescription>
                      {editingReminderId ? "Posodobite podrobnosti opomnika." : "Dodajte nov dogodek ali opomnik v vaš družinski koledar. Izberite časovni okvir in kategorijo."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateReminder} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Naziv opomnika</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kaj se dogaja?" required />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-day" 
                        checked={isAllDay} 
                        onCheckedChange={(checked) => {
                          setIsAllDay(checked === true);
                          if (checked) {
                            setStartDate(format(new Date(startDate), "yyyy-MM-dd"));
                            setEndDate(format(new Date(endDate), "yyyy-MM-dd"));
                          } else {
                            setStartDate(format(new Date(startDate), "yyyy-MM-dd'T'HH:mm"));
                            setEndDate(format(new Date(endDate), "yyyy-MM-dd'T'HH:mm"));
                          }
                        }} 
                      />
                      <Label htmlFor="all-day" className="font-medium cursor-pointer">Celotni dan</Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Začetek (Od)</Label>
                        <Input 
                          type={isAllDay ? "date" : "datetime-local"} 
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Konec (Do)</Label>
                        <Input 
                          type={isAllDay ? "date" : "datetime-local"} 
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)} 
                          required 
                        />
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
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                      {editingReminderId ? "Shrani spremembe" : "Ustvari opomnik"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="container max-w-2xl mt-8 px-4">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-background neu-pressed rounded-full border-none h-12">
              <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neu-flat transition-all">Aktivni ({activeReminders.length})</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neu-flat transition-all">Opravljeni ({completedReminders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {activeReminders.length === 0 ? (
                <div className="text-center py-20 px-8 bg-background neu-pressed rounded-[1.5rem] border-transparent">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-12 h-12 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Vse je v redu! 🎉</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">Trenutno nimate aktivnih opomnikov. Ustvarite prvega s klikom na gumb "Dodaj".</p>
                  <Button 
                    size="sm" 
                    className="rounded-full bg-primary hover:bg-primary/90"
                    onClick={() => setIsReminderOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Dodaj opomnik
                  </Button>
                </div>
              ) : (
                activeReminders.map(r => <ReminderCard key={r.id} reminder={r} onToggle={handleToggleComplete} onEdit={handleEditReminder} onDelete={handleDeleteReminder} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedReminders.length === 0 ? (
                <div className="text-center py-20 px-8 bg-background neu-pressed rounded-[1.5rem] border-transparent">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-accent/40" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Še opravil za prikaz</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">Ko boste označili opomnike kot opravljene, se bodo pojavili tukaj.</p>
                </div>
              ) : (
                completedReminders.map(r => <ReminderCard key={r.id} reminder={r} onToggle={handleToggleComplete} onEdit={handleEditReminder} onDelete={handleDeleteReminder} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

function ReminderCard({ reminder, onToggle, onEdit, onDelete }: { reminder: any, onToggle: (id: string, s: boolean) => void, onEdit: (r: any) => void, onDelete: (id: string) => void }) {
  const hasCat = !!reminder.category;
  const catColor = reminder.category?.color;
  
  return (
    <Card className={cn("p-5 rounded-[1.5rem] border-transparent transition-all neu-flat", reminder.completed && "opacity-60 grayscale")}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={reminder.completed}
          onCheckedChange={() => onToggle(reminder.id, reminder.completed)}
          className="mt-1 w-6 h-6 rounded-full border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground neu-pressed"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn("text-lg font-bold text-foreground", reminder.completed && "line-through")}>{reminder.title}</h3>
            {hasCat && (
              <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-widest border-none px-2 relative overflow-hidden" style={{ color: catColor }}>
                <div className="absolute inset-0 opacity-15" style={{ backgroundColor: catColor }} />
                <span className="relative z-10">{reminder.category.name}</span>
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {(() => {
                  const start = new Date(reminder.start_time);
                  const end = new Date(reminder.end_time);
                  const isMultiDay = !reminder.is_all_day && 
                    (start.toDateString() !== end.toDateString());
                  
                  if (reminder.is_all_day) {
                    const startStr = format(start, "d. MMMM yyyy", { locale: sl });
                    const endStr = format(end, "d. MMMM yyyy", { locale: sl });
                    if (startStr === endStr) {
                      return `${startStr} (Celodnevni)`;
                    }
                    return `${startStr} — ${endStr} (Celodnevni)`;
                  }
                  
                  if (isMultiDay) {
                    return `${format(start, "d. MMM 'ob' HH:mm", { locale: sl })} — ${format(end, "d. MMM 'ob' HH:mm", { locale: sl })}`;
                  }
                  
                  return `${format(start, "d. MMM 'ob' HH:mm", { locale: sl })} — ${format(end, "HH:mm", { locale: sl })}`;
                })()}
              </span>
            </div>
            {reminder.category?.visibility_level === 'parents' && (
              <div className="flex items-center gap-1 text-[10px] text-purple-500 font-bold uppercase">
                <EyeOff className="w-3 h-3" /> Samo starši
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => onEdit(reminder)}>
            <Pencil className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(reminder.id)}>
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}