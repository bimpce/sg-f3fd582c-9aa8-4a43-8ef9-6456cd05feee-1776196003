-- Posodobitev kategorij (če so že ustvarjene, dodamo manjkajoče)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        CREATE TABLE public.categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            color TEXT NOT NULL DEFAULT '#6495ED',
            visibility_level TEXT NOT NULL DEFAULT 'all',
            family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            CONSTRAINT categories_visibility_check CHECK (visibility_level IN ('all', 'parents'))
        );
    END IF;
END $$;

-- Posodobitev opomnikov
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reminders') THEN
        CREATE TABLE public.reminders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT NULL,
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE NOT NULL,
            category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
            family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
            creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
            completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END $$;

-- Omogočanje RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Politike za kategorije
DROP POLICY IF EXISTS "Public read categories in family" ON public.categories;
CREATE POLICY "Public read categories in family" ON public.categories
    FOR SELECT USING (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Super-admins and parents can manage categories" ON public.categories;
CREATE POLICY "Super-admins and parents can manage categories" ON public.categories
    FOR ALL USING (
        family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()) AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
    );

-- Politike za opomnike
DROP POLICY IF EXISTS "Select reminders based on visibility" ON public.reminders;
CREATE POLICY "Select reminders based on visibility" ON public.reminders
    FOR SELECT USING (
        family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()) AND
        (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'parent') OR
            category_id IS NULL OR
            (SELECT visibility_level FROM public.categories WHERE id = category_id) = 'all'
        )
    );

DROP POLICY IF EXISTS "Insert reminders" ON public.reminders;
CREATE POLICY "Insert reminders" ON public.reminders
    FOR INSERT WITH CHECK (family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Update own reminders or as parent" ON public.reminders;
CREATE POLICY "Update own reminders or as parent" ON public.reminders
    FOR UPDATE USING (
        creator_id = auth.uid() OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
    );

DROP POLICY IF EXISTS "Delete reminders as creator or parent" ON public.reminders;
CREATE POLICY "Delete reminders as creator or parent" ON public.reminders
    FOR DELETE USING (
        creator_id = auth.uid() OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'parent')
    );