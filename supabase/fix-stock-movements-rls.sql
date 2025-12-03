-- Fix RLS policies for stock_movements table
-- This allows authenticated users to insert and view stock movements

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can insert stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can update stock movements" ON stock_movements;

-- Create new policies for stock_movements
CREATE POLICY "Users can view stock movements"
  ON stock_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock movements"
  ON stock_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update stock movements"
  ON stock_movements
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also ensure products table allows updates for stock adjustments
DROP POLICY IF EXISTS "Users can update products" ON products;

CREATE POLICY "Users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON stock_movements TO authenticated;
GRANT ALL ON products TO authenticated;
