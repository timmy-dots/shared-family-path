-- Create values_questionnaire table for storing questionnaire responses
CREATE TABLE public.values_questionnaire (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.values_questionnaire ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own responses and family members' responses
CREATE POLICY "Users can view own and family responses" 
ON public.values_questionnaire 
FOR SELECT 
USING (
  auth.uid() = user_id
  OR family_id IN (
    SELECT family_id FROM family_members WHERE user_id = auth.uid()
  )
  OR family_id IN (
    SELECT id FROM families WHERE owner_id = auth.uid()
  )
);

-- RLS Policy: Users can insert their own responses
CREATE POLICY "Users can insert own responses" 
ON public.values_questionnaire 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own responses
CREATE POLICY "Users can update own responses" 
ON public.values_questionnaire 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own responses
CREATE POLICY "Users can delete own responses" 
ON public.values_questionnaire 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_values_questionnaire_updated_at
BEFORE UPDATE ON public.values_questionnaire
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();