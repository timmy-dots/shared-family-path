-- Create invite_status enum if not exists
DO $$ BEGIN
  CREATE TYPE public.invite_status AS ENUM ('pending','accepted','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create family_invites table
CREATE TABLE IF NOT EXISTS public.family_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  email text NOT NULL,
  role family_role NOT NULL DEFAULT 'member',
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status invite_status NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  accepted_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- Policies: Owner manages invites
CREATE POLICY IF NOT EXISTS "Owner manages invites"
ON public.family_invites
FOR ALL
USING (public.is_family_owner(auth.uid(), family_id))
WITH CHECK (public.is_family_owner(auth.uid(), family_id));

-- Create vault_permissions table
CREATE TABLE IF NOT EXISTS public.vault_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  user_id uuid NOT NULL,
  can_write boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

ALTER TABLE public.vault_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for vault_permissions
CREATE POLICY IF NOT EXISTS "Owner manages vault permissions"
ON public.vault_permissions
FOR ALL
USING (public.is_family_owner(auth.uid(), family_id))
WITH CHECK (public.is_family_owner(auth.uid(), family_id));

CREATE POLICY IF NOT EXISTS "Users can view own vault permission"
ON public.vault_permissions
FOR SELECT
USING (user_id = auth.uid());

-- Function to check vault write permission
CREATE OR REPLACE FUNCTION public.has_vault_write(_user_id uuid, _family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_family_owner(_user_id, _family_id)
    OR EXISTS (
      SELECT 1 FROM public.vault_permissions vp
      WHERE vp.family_id = _family_id AND vp.user_id = _user_id AND vp.can_write = true
    );
$$;

-- Accept invite function
CREATE OR REPLACE FUNCTION public.accept_family_invite(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.family_invites%ROWTYPE;
  v_claims jsonb;
  v_email text;
BEGIN
  SELECT * INTO v_invite 
  FROM public.family_invites 
  WHERE token = _token AND status = 'pending'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get email from JWT claims
  BEGIN
    v_claims := auth.jwt();
  EXCEPTION WHEN undefined_function THEN
    v_claims := current_setting('request.jwt.claims', true)::jsonb;
  END;
  v_email := lower(coalesce(v_claims->>'email',''));

  IF v_email IS NULL OR v_email = '' OR lower(v_invite.email) <> v_email THEN
    RETURN false;
  END IF;

  -- Insert membership for current user
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (v_invite.family_id, auth.uid(), v_invite.role)
  ON CONFLICT (family_id, user_id) DO NOTHING;

  -- Mark invite accepted
  UPDATE public.family_invites
    SET status = 'accepted',
        accepted_at = now(),
        accepted_user_id = auth.uid()
  WHERE id = v_invite.id;

  RETURN true;
END;
$$;

-- Storage policies for documents bucket
CREATE POLICY IF NOT EXISTS "Family docs readable by members"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.is_family_member(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY IF NOT EXISTS "Family docs insert by owner or writers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND public.has_vault_write(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY IF NOT EXISTS "Family docs update by owner or writers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.has_vault_write(auth.uid(), (storage.foldername(name))[1]::uuid)
)
WITH CHECK (
  bucket_id = 'documents'
  AND public.has_vault_write(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY IF NOT EXISTS "Family docs delete by owner or writers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.has_vault_write(auth.uid(), (storage.foldername(name))[1]::uuid)
);
