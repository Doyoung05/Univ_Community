-- Storage DELETE policy for archives
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'archives' AND auth.uid() = owner);

-- Admin policy for profiles
CREATE POLICY "Admins can update any profile." ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RPC to adjust points by admin
CREATE OR REPLACE FUNCTION adjust_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Security check: Only admins can adjust points
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can adjust points';
  END IF;

  -- Update profile points
  UPDATE profiles SET points = points + p_amount WHERE id = p_user_id;

  -- Record point history
  INSERT INTO points_history (profile_id, amount, reason)
  VALUES (p_user_id, p_amount, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to update user role by admin
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_role TEXT
) RETURNS VOID AS $$
BEGIN
  -- Security check: Only admins can update roles
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;

  -- Validate role
  IF p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Update profile role
  UPDATE profiles SET role = p_role WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
