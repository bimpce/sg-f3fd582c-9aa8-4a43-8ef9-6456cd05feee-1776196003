-- Preverimo RLS za kategorije še enkrat in se prepričamo, da so stolpci pravilni
DO $$ 
BEGIN
    -- Zagotovimo, da imamo stolpec visibility_level z ustreznimi vrednostmi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'visibility_level') THEN
        ALTER TABLE public.categories ADD COLUMN visibility_level TEXT DEFAULT 'all';
    END IF;

    -- Zagotovimo, da imamo stolpec color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
        ALTER TABLE public.categories ADD COLUMN color TEXT DEFAULT '#6495ED';
    END IF;
END $$;

-- Popravimo RLS politiko za vstavljanje, da bo bolj robustna
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
CREATE POLICY "categories_insert_policy" ON public.categories 
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  (
    -- Preverimo, če je uporabnik starš ali super_admin v svoji družini
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'parent' OR role = 'super_admin')
    )
  )
);