@@ .. @@
 -- Safe migration to add INSERT policy for medicao table
 -- This only ADDS a new policy without modifying existing ones

+-- Ensure the policy name is unique and descriptive
+DO $$
+BEGIN
+  -- Log current state
+  RAISE NOTICE 'Adding INSERT policy for PWA medicao access';
+  RAISE NOTICE 'Current user: %', current_user;
+  RAISE NOTICE 'Current role: %', current_setting('role', true);
+END $$;
+
 -- Create is_admin function if it doesn't exist
 CREATE OR REPLACE FUNCTION is_admin()
 RETURNS boolean AS $$
@@ .. @@
   LANGUAGE sql SECURITY DEFINER;

 -- Add INSERT policy for medicao table (safe - only adds, doesn't modify existing)
+-- This policy allows:
+-- 1. Admins to insert any medicao
+-- 2. Authenticated users to insert medicao for their authorized clients
 CREATE POLICY IF NOT EXISTS "PWA_medicao_insert_policy"
   ON medicao
   FOR INSERT
   TO authenticated
   WITH CHECK (
+    -- Admin users can insert anything
     is_admin() 
     OR 
+    -- Regular users can only insert for their authorized clients
     (
       EXISTS (
         SELECT 1 
         FROM client_users 
         WHERE client_users.client_id = medicao.cliente_id 
-        AND client_users.user_id = auth.uid()
+        AND client_users.user_id = auth.uid()::uuid
       )
     )
   );

+-- Log successful completion
+DO $$
+BEGIN
+  RAISE NOTICE 'PWA medicao INSERT policy created successfully';
+  
+  -- Show current policies for verification
+  RAISE NOTICE 'Current INSERT policies on medicao table:';
+  FOR rec IN 
+    SELECT policyname, cmd, with_check 
+    FROM pg_policies 
+    WHERE tablename = 'medicao' 
+    AND cmd = 'INSERT'
+  LOOP
+    RAISE NOTICE '  - Policy: % (CMD: %) CHECK: %', rec.policyname, rec.cmd, rec.with_check;
+  END LOOP;
+END $$;