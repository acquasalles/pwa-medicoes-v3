@@ .. @@
 -- Safe migration to add INSERT policy for medicao table
 -- This migration only ADDS policies, never removes existing ones
 
+-- First ensure we have the auth schema functions available
+DO $$
+BEGIN
+  -- Test if auth.uid() is accessible
+  PERFORM auth.uid();
+  RAISE NOTICE '✅ auth.uid() is accessible';
+EXCEPTION WHEN OTHERS THEN
+  RAISE NOTICE '❌ auth.uid() not accessible: %', SQLERRM;
+END $$;
+
 -- Create is_admin function if it doesn't exist
 CREATE OR REPLACE FUNCTION is_admin()
 RETURNS boolean AS $$
@@ .. @@
 -- Add INSERT policy for regular users (authorized clients only)
 DO $$
 BEGIN
-    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'PWA_medicao_insert_policy') THEN
+    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medicao' AND policyname = 'PWA_medicao_insert_policy') THEN
         CREATE POLICY "PWA_medicao_insert_policy"
             ON medicao
             FOR INSERT
             TO authenticated
-            WITH CHECK (
-                is_admin() OR 
-                EXISTS (
-                    SELECT 1 FROM client_users 
-                    WHERE client_users.client_id = medicao.cliente_id 
-                    AND client_users.user_id = auth.uid()::uuid
+            WITH CHECK (CASE 
+                WHEN is_admin() THEN true
+                ELSE EXISTS (
+                    SELECT 1 FROM client_users cu
+                    WHERE cu.client_id = medicao.cliente_id 
+                    AND cu.user_id = auth.uid()
                 )
-            );
+            END);
         
         RAISE NOTICE '✅ Created PWA_medicao_insert_policy';
     ELSE
@@ .. @@