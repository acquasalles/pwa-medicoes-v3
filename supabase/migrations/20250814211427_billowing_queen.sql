/*
  # Add INSERT and DELETE policies for medicao_items table

  1. New Policies
    - `Admins and authorized users can insert measurement items`
      - Allows INSERT for admins or users with access to the related client
      - Uses WITH CHECK to validate data being inserted
    - `Admins and authorized users can delete measurement items` 
      - Allows DELETE for admins or users with access to the related client
      - Uses USING to validate existing records being deleted

  2. Security
    - Both policies check user authorization through the medicao -> client relationship
    - Maintains client isolation - users can only access items for their authorized clients
    - Admin bypass allows full access for administrative operations
*/

-- Policy for INSERT operations on medicao_items
CREATE POLICY "Admins and authorized users can insert measurement items"
ON medicao_items
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() OR (
    EXISTS (
      SELECT 1
      FROM medicao m
      JOIN client_users cu ON cu.client_id = m.cliente_id
      WHERE m.id = medicao_items.medicao_id
      AND cu.user_id = auth.uid()
    )
  )
);

-- Policy for DELETE operations on medicao_items  
CREATE POLICY "Admins and authorized users can delete measurement items"
ON medicao_items
FOR DELETE
TO authenticated
USING (
  is_admin() OR (
    EXISTS (
      SELECT 1
      FROM medicao m
      JOIN client_users cu ON cu.client_id = m.cliente_id
      WHERE m.id = medicao_items.medicao_id
      AND cu.user_id = auth.uid()
    )
  )
);