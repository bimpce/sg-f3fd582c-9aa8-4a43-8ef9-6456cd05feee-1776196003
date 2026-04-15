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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Trash2, CheckSquare } from "lucide-react";
import { SupabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sl } from "date-fns/locale";

type TaskWithRelations = any; // Will map to the join response

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
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
    
    const [fetchedTasks, fetchedMembers] = await Promise.all([
      SupabaseService.getTasks(familyId),
      SupabaseService.getFamilyMembers(familyId),
    ]);

    if (fetchedTasks) setTasks(fetchedTasks);
    if (fetchedMembers) setMembers(fetchedMembers);
    
    setLoading(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !session?.user) return;

    setIsSubmitting(true);
    const newTask = await SupabaseService.createTask({
      title,
      family_id: session.user.family_id as string,
      creator_id: session.user.id,
      assignee_id: assigneeId || null,
      priority,
      completed: false,
    });

    setIsSubmitting(false);

    if (newTask) {
      toast({
        title: "Naloga ustvarjena",
        description: "Nova naloga je bila uspešno dodana.",
      });
      setIsDialogOpen(false);
      setTitle("");
      setAssigneeId("");
      setPriority("medium");
      loadData();
    } else {
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri ustvarjanju naloge.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    const success = await SupabaseService.updateTask(taskId, {
      completed: !currentStatus,
    });

    if (success) {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const success = await SupabaseService.deleteTask(taskId);
    if (success) {
      toast({
        title: "Naloga izbrisana",
        description: "Naloga je bila odstranjena s seznama.",
      });
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Naloge - FamilySync" />
      
      <div className="min-h-screen pb-24 bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
          <div className="container max-w-2xl flex items-center justify-between">
            <h1 className="text-xl font-bold">Družinske naloge</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Dodaj
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova naloga</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Kaj je potrebno narediti?</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Npr. Posesaj dnevno sobo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Določi člana (neobvezno)</Label>
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Izberi člana" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Vsi (Nedoločeno)</SelectItem>
                        {members.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name || member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioriteta</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioriteta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Nizka</SelectItem>
                        <SelectItem value="medium">Srednja</SelectItem>
                        <SelectItem value="high">Visoka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Shranjevanje..." : "Ustvari nalogo"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="container max-w-2xl mt-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">
                V teku ({activeTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Opravljeno ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeTasks.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-xl">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">Vse naloge so opravljene!</h3>
                  <p className="text-sm text-muted-foreground">Trenutno nimate nobenih odprtih nalog.</p>
                </div>
              ) : (
                activeTasks.map(task => <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-muted-foreground">Ni še opravljenih nalog.</p>
                </div>
              ) : (
                completedTasks.map(task => <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </>
  );
}

function TaskCard({ task, onToggle, onDelete }: { task: any, onToggle: (id: string, status: boolean) => void, onDelete: (id: string) => void }) {
  const priorityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }[task.priority as string] || "bg-gray-100 text-gray-800";

  const priorityLabel = {
    low: "Nizka",
    medium: "Srednja",
    high: "Visoka",
  }[task.priority as string] || "Srednja";

  return (
    <Card className={`p-4 transition-all ${task.completed ? "opacity-60 bg-muted/30" : "bg-card hover:shadow-md"}`}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id, task.completed)}
          className="mt-1 w-5 h-5 rounded-full"
        />
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-base mb-1 ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </p>
          
          <div className="flex items-center gap-3 flex-wrap mt-2">
            {task.assignee && (
              <div className="flex items-center gap-1.5 text-xs font-medium bg-secondary/50 px-2 py-1 rounded-full">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={task.assignee.avatar_url} />
                  <AvatarFallback className="text-[8px]">{task.assignee.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span>{task.assignee.name}</span>
              </div>
            )}
            
            <Badge variant="secondary" className={`text-xs ${priorityColor} border-none`}>
              {priorityLabel}
            </Badge>
            
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(task.created_at), "d. MMM", { locale: sl })}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}