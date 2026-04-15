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
      label: "Naloge",
      icon: CheckSquare,
      href: "/tasks",
      active: currentPath === "/tasks",
    },
    {
      label: "Profil",
      icon: User,
      href: "/profile",
      active: currentPath === "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] py-4 px-6 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all",
                item.active ? "text-[#6495ED]" : "text-[#A0A0A0]"
              )}
            >
              <item.icon className={cn("w-8 h-8", item.active && "stroke-[2.5px]")} />
              <span className={cn("text-xs font-bold", item.active ? "opacity-100" : "opacity-80")}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
      {/* Home indicator bar (iOS style) */}
      <div className="w-32 h-1.5 bg-[#E0E0E0] rounded-full mx-auto mt-4 opacity-50" />
    </nav>
  );
}