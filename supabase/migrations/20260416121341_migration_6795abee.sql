DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'is_all_day') THEN
        ALTER TABLE public.reminders ADD COLUMN is_all_day BOOLEAN DEFAULT false;
    END IF;
END $$;