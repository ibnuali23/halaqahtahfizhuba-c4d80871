-- Fix profiles RLS: Restrict to own profile for regular users, allow admin full access
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any profile
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE policy for user_roles (admins only)
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add DELETE policy for pengaturan_sistem (admins only)
CREATE POLICY "Admins can delete system settings"
ON public.pengaturan_sistem
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));