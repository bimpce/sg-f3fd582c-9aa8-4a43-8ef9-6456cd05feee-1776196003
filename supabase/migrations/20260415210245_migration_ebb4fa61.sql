-- 1. Ustvarjanje tabele za kategorije
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6495ED',
    visibility_level TEXT NOT NULL DEFAULT 'all',
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT categories_visibility_check CHECK (visibility_level IN ('all', 'parents'))
);

-- 2. Ustvarjanje tabele za opomnike (reminders)
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Omogočanje RLS (Row Level Security)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- 4. RLS pravila za kategorije (T2 pattern - javno v družini)
CREATE POLICY "Public read categories in family" ON public.categories 
    FOR SELECT USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Super-admins and parents can manage categories" ON public.categories 
    FOR ALL USING (
        family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()) 
        AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
    );

-- 5. RLS pravila za opomnike
-- Vidnost: Vsi v družini vidijo 'all' opomnike, starši vidijo vse
CREATE POLICY "Select reminders based on visibility" ON public.reminders
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
        AND (
            (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
            OR 
            category_id IS NULL 
            OR 
            (SELECT visibility_level FROM categories WHERE id = category_id) = 'all'
        )
    );

CREATE POLICY "Insert reminders" ON public.reminders
    FOR INSERT WITH CHECK (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Update own reminders or as parent" ON public.reminders
    FOR UPDATE USING (
        creator_id = auth.uid() 
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
    );

CREATE POLICY "Delete reminders as creator or parent" ON public.reminders
    FOR DELETE USING (
        creator_id = auth.uid() 
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
    );

-- 6. Osnovne kategorije za vsako družino (opcijsko, lahko dodamo kasneje preko UI)