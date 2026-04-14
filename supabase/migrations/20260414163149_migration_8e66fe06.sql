-- Odstranimo stare stroge RLS policies, ki so blokirale NextAuth
DROP POLICY IF EXISTS "Family members can view family" ON families;
DROP POLICY IF EXISTS "Super admin can update family" ON families;
DROP POLICY IF EXISTS "Family members can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Family members can view public events" ON events;
DROP POLICY IF EXISTS "Parents can view private events" ON events;
DROP POLICY IF EXISTS "Users with permission can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events or with permission" ON events;
DROP POLICY IF EXISTS "Users with permission can delete events" ON events;
DROP POLICY IF EXISTS "Family members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Users with permission can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own or assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can complete own tasks" ON tasks;
DROP POLICY IF EXISTS "Family members can view permissions" ON permissions;
DROP POLICY IF EXISTS "Super admin can update permissions" ON permissions;

-- Dodamo permissive policies (NextAuth sedaj skrbi za avtentikacijo in avtorizacijo)
CREATE POLICY "NextAuth permissive families" ON families FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "NextAuth permissive profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "NextAuth permissive events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "NextAuth permissive tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "NextAuth permissive permissions" ON permissions FOR ALL USING (true) WITH CHECK (true);