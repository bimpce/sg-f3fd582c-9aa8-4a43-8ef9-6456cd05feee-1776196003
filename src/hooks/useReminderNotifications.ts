"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Reminder } from "@/integrations/supabase/types";

interface NotificationConfig {
  intervals: number[]; // minutes before reminder to notify (e.g., [15, 5, 0])
  pollIntervalMs: number; // how often to check (default 30000 = 30s)
}

const DEFAULT_CONFIG: NotificationConfig = {
  intervals: [15, 5, 0],
  pollIntervalMs: 30000,
};

export function useReminderNotifications(
  reminders: Reminder[],
  config: Partial<NotificationConfig> = {}
) {
  const { toast } = useToast();
  const notifiedRefs = useRef<Set<string>>(new Set());
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const checkReminders = useCallback(() => {
    const now = new Date();

    for (const reminder of reminders) {
      if (!reminder.start_time || reminder.is_completed) continue;

      const reminderTime = new Date(reminder.start_time);
      const diffMs = reminderTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      for (const interval of finalConfig.intervals) {
        const windowStart = interval;
        const windowEnd = interval + (finalConfig.pollIntervalMs / 60000);

        if (diffMinutes <= windowStart && diffMinutes > -windowEnd) {
          const notifyKey = `${reminder.id}-${interval}`;
          if (notifiedRefs.current.has(notifyKey)) continue;

          notifiedRefs.current.add(notifyKey);

          const timeLabel =
            interval === 0
              ? " zdaj!"
              : interval === 1
              ? " čez 1 minuto"
              : ` čez ${interval} minut`;

          toast({
            title: "🔔 Opomnik",
            description: `${reminder.title}${timeLabel}`,
            duration: interval === 0 ? 10000 : 5000,
          });
        }
      }
    }
  }, [reminders, toast, finalConfig]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, finalConfig.pollIntervalMs);
    return () => clearInterval(interval);
  }, [checkReminders, finalConfig.pollIntervalMs]);
}