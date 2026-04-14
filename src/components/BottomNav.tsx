import { Calendar, CheckSquare, Bell, User } from "lucide-react";
import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="container max-w-2xl mx-auto px-0">
        <div className="grid grid-cols-4 gap-1">
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-3 px-2 text-primary hover:bg-secondary/50 transition-colors rounded-lg"
          >
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Koledar</span>
          </Link>

          <Link
            href="/tasks"
            className="flex flex-col items-center justify-center py-3 px-2 text-muted-foreground hover:bg-secondary/50 transition-colors rounded-lg"
          >
            <CheckSquare className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Naloge</span>
          </Link>

          <Link
            href="/notifications"
            className="flex flex-col items-center justify-center py-3 px-2 text-muted-foreground hover:bg-secondary/50 transition-colors rounded-lg relative"
          >
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Obvestila</span>
            <span className="absolute top-2 right-6 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center py-3 px-2 text-muted-foreground hover:bg-secondary/50 transition-colors rounded-lg"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Profil</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}