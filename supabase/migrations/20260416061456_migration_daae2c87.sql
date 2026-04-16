-- Posodobitev in poenostavitev RLS politik za kategorije
-- Najprej odstranimo stare politike, če obstajajo, da preprečimo konflikte
DROP POLICY IF EXISTS "Public read categories in family" ON public.categories;
DROP POLICY IF EXISTS "Super-admins and parents can manage categories" ON public.categories;
DROP POLICY IF EXISTS "family_insert" ON public.categories;

-- 1. Politika za branje (vsi člani družine lahko vidijo kategorije)
CREATE POLICY "categories_select_policy" ON public.categories 
FOR SELECT USING (
  family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
);

-- 2. Politika za vnos (samo starši in super-admini lahko dodajajo kategorije)
CREATE POLICY "categories_insert_policy" ON public.categories 
FOR INSERT WITH CHECK (
  family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()) AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
);

-- 3. Politika za posodabljanje
CREATE POLICY "categories_update_policy" ON public.categories 
FOR UPDATE USING (
  family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()) AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
);

-- 4. Politika za brisanje
CREATE POLICY "categories_delete_policy" ON public.categories 
FOR DELETE USING (
  family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()) AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
);