import { Calendar, CheckSquare, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    {
      label: "Koledar",
      icon: Calendar,
      href: "/",
      active: currentPath === "/",
    },
    {
      label: "Opomniki",
      icon: CheckSquare,
      href: "/reminders",
      active: currentPath === "/reminders",
    },
    {
      label: "Profil",
      icon: User,
      href: "/profile",
      active: currentPath === "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/10 py-4 px-6 z-50 neu-flat rounded-t-[2rem]">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all",
                item.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-7 h-7", item.active && "stroke-[2.5px]")} />
              <span className={cn("text-xs font-medium", item.active ? "opacity-100" : "opacity-80")}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
      {/* Home indicator bar (iOS style) - REMOVING THIS ELEMENT */}
      {/* <div className="w-32 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mt-4" /> */}
    </nav>
  );
}