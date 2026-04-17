import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Reminder } from "@/integrations/supabase/types";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      const { data } = await supabase
        .from("reminders")
        .select("*")
        .eq("completed", false)
        .gte("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      setReminders((data as Reminder[]) || []);
    };

    fetchReminders();

    const channel = supabase
      .channel("reminder-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reminders" },
        () => fetchReminders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useReminderNotifications(reminders);

  return <>{children}</>;
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider session={session}>
        <NotificationProvider>
          <Component {...pageProps} />
          <Toaster />
        </NotificationProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}