-- Preverimo in dodamo manjkajoče stolpce v tabelo categories, če ne obstajajo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'visibility_level') THEN
        ALTER TABLE public.categories ADD COLUMN visibility_level TEXT DEFAULT 'all';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
        ALTER TABLE public.categories ADD COLUMN color TEXT DEFAULT '#6495ED';
    END IF;
END $$;

-- Zagotovimo, da so RLS politike pravilno nastavljene za vnos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'family_insert'
    ) THEN
        CREATE POLICY "family_insert" ON public.categories FOR INSERT WITH CHECK (true);
    END IF;
END $$;