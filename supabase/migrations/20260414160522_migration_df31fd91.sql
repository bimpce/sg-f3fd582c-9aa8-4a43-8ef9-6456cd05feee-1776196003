-- Migration 004: Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Families Policies
CREATE POLICY "Family members can view family"
  ON families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Super admin can update family"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Profiles Policies
CREATE POLICY "Family members can view profiles"
  ON profiles FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Events Policies
CREATE POLICY "Family members can view public events"
  ON events FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    ) AND
    (visibility_level = 'all' OR creator_id = auth.uid())
  );

CREATE POLICY "Parents can view private events"
  ON events FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('parent', 'super_admin')
    )
  );

CREATE POLICY "Users can create events in own family"
  ON events FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    ) AND
    creator_id = auth.uid()
  );

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (creator_id = auth.uid());

-- Tasks Policies
CREATE POLICY "Family members can view tasks"
  ON tasks FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in own family"
  ON tasks FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    ) AND
    creator_id = auth.uid()
  );

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (
    creator_id = auth.uid() OR assignee_id = auth.uid()
  );

CREATE POLICY "Users can complete own tasks"
  ON tasks FOR UPDATE
  USING (assignee_id = auth.uid());

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (creator_id = auth.uid());

-- Permissions Policies
CREATE POLICY "Family members can view permissions"
  ON permissions FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Super admin can update permissions"
  ON permissions FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );