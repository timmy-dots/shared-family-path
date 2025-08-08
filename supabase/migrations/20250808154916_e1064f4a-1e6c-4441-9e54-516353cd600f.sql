-- Enum for family roles
DO $$ BEGIN
  CREATE TYPE public.family_role AS ENUM ('head', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Families table
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Family members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.family_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Profiles table (personal details)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  full_name TEXT,
  date_of_birth DATE,
  relationship_role TEXT,
  marital_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Financial snapshots
CREATE TABLE IF NOT EXISTS public.financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  income NUMERIC(14,2) NOT NULL DEFAULT 0,
  assets JSONB NOT NULL DEFAULT '{}',
  liabilities JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;

-- Governance answers
CREATE TABLE IF NOT EXISTS public.governance_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  values_answers JSONB NOT NULL DEFAULT '[]',
  decision_style TEXT,
  conflict_prefs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_answers ENABLE ROW LEVEL SECURITY;

-- Family tree nodes (simple parent-child)
CREATE TABLE IF NOT EXISTS public.family_tree (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  relation TEXT,
  parent_id UUID REFERENCES public.family_tree(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_tree ENABLE ROW LEVEL SECURITY;

-- Update timestamp trigger function (generic)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to profiles
DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger to auto-add family owner as member
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'head')
  ON CONFLICT (family_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_add_owner_as_member
  AFTER INSERT ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policies
-- Families: owner can do everything; members can read
DROP POLICY IF EXISTS "Families owner full access" ON public.families;
CREATE POLICY "Families owner full access" ON public.families
FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Families members can view" ON public.families;
CREATE POLICY "Families members can view" ON public.families
FOR SELECT TO authenticated
USING (
  owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.family_members m
    WHERE m.family_id = families.id AND m.user_id = auth.uid()
  )
);

-- Family members policies
DROP POLICY IF EXISTS "Members manage their membership" ON public.family_members;
CREATE POLICY "Members manage their membership" ON public.family_members
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner can view all family members" ON public.family_members;
CREATE POLICY "Owner can view all family members" ON public.family_members
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.families f
  WHERE f.id = family_members.family_id AND f.owner_id = auth.uid()
));

-- Profiles: users manage their own
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles
FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Financial snapshots: user only
DROP POLICY IF EXISTS "Users manage own financials" ON public.financial_snapshots;
CREATE POLICY "Users manage own financials" ON public.financial_snapshots
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Governance answers: user only
DROP POLICY IF EXISTS "Users manage own governance" ON public.governance_answers;
CREATE POLICY "Users manage own governance" ON public.governance_answers
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Family tree: user only
DROP POLICY IF EXISTS "Users manage own family tree" ON public.family_tree;
CREATE POLICY "Users manage own family tree" ON public.family_tree
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());