import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddButtonProps {
  onClick?: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground z-40 hover:scale-110 transition-all duration-200"
    >
      <Plus className="w-8 h-8" />
    </Button>
  );
}