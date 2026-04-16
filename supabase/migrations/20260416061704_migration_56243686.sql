-- Posodobitev varnostnih pravil (RLS) za kategorije in opomnike, da bodo skladna z NextAuth vzorcem v tem projektu
-- To bo omogočilo vnos podatkov, ko je uporabnik prijavljen prek NextAuth

-- Kategorije
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories;

CREATE POLICY "NextAuth permissive categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Opomniki
DROP POLICY IF EXISTS "Select reminders based on visibility" ON public.reminders;
DROP POLICY IF EXISTS "Insert reminders" ON public.reminders;
DROP POLICY IF EXISTS "Update own reminders or as parent" ON public.reminders;
DROP POLICY IF EXISTS "Delete reminders as creator or parent" ON public.reminders;

CREATE POLICY "NextAuth permissive reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);

-- Prav tako se prepričamo, da so vsi potrebni stolpci v tabeli reminders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'completed') THEN
        ALTER TABLE public.reminders ADD COLUMN completed BOOLEAN DEFAULT false;
    END IF;
END $$;