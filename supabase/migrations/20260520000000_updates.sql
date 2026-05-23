-- Add file_url to posts
ALTER TABLE posts ADD COLUMN file_url TEXT;

-- Add is_accepted to comments
ALTER TABLE comments ADD COLUMN is_accepted BOOLEAN DEFAULT FALSE;

-- RPC function to accept an answer
CREATE OR REPLACE FUNCTION accept_answer(
  p_post_id UUID,
  p_comment_id UUID,
  p_points INTEGER
) RETURNS VOID AS $$
DECLARE
  v_author_id UUID;
  v_commenter_id UUID;
BEGIN
  -- Get post author and commenter IDs
  SELECT author_id INTO v_author_id FROM posts WHERE id = p_post_id;
  SELECT author_id INTO v_commenter_id FROM comments WHERE id = p_comment_id;

  -- Security check: Only the post author can accept an answer
  IF v_author_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the post author can accept an answer';
  END IF;

  -- Check if the post is already resolved
  IF EXISTS (SELECT 1 FROM posts WHERE id = p_post_id AND status = 'resolved') THEN
    RAISE EXCEPTION 'This post is already resolved';
  END IF;

  -- Update comment status
  UPDATE comments SET is_accepted = TRUE WHERE id = p_comment_id;

  -- Update post status
  UPDATE posts SET status = 'resolved' WHERE id = p_post_id;

  -- Award points to the commenter
  UPDATE profiles SET points = points + p_points WHERE id = v_commenter_id;

  -- Record point history
  INSERT INTO points_history (profile_id, amount, reason)
  VALUES (v_commenter_id, p_points, 'Q&A 채택 포인트');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for archives (if storage schema exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('archives', 'archives', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for archives
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'archives');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'archives' AND auth.role() = 'authenticated');
