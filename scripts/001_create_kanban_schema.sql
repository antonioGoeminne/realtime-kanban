-- Create boards table
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create columns table
CREATE TABLE IF NOT EXISTS public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- For this demo, allow public read/write access (no auth required)
-- In production, you would add user_id columns and restrict by auth.uid()

CREATE POLICY "Allow public read on boards" ON public.boards
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on boards" ON public.boards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on boards" ON public.boards
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on boards" ON public.boards
  FOR DELETE USING (true);

CREATE POLICY "Allow public read on columns" ON public.columns
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on columns" ON public.columns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on columns" ON public.columns
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on columns" ON public.columns
  FOR DELETE USING (true);

CREATE POLICY "Allow public read on cards" ON public.cards
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on cards" ON public.cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on cards" ON public.cards
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on cards" ON public.cards
  FOR DELETE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;

-- Insert default board with columns
INSERT INTO public.boards (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'My Project Board')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.columns (id, board_id, name, position)
VALUES 
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'To Do', 0),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'In Progress', 1),
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Done', 2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample cards
INSERT INTO public.cards (column_id, title, description, priority, position)
VALUES 
  ('00000000-0000-0000-0000-000000000010', 'Design mockups', 'Create UI/UX designs for the new feature', 'high', 0),
  ('00000000-0000-0000-0000-000000000010', 'Set up database', 'Configure PostgreSQL and create tables', 'medium', 1),
  ('00000000-0000-0000-0000-000000000020', 'Implement API', 'Build REST endpoints for the backend', 'high', 0),
  ('00000000-0000-0000-0000-000000000030', 'Write documentation', 'Document the API endpoints', 'low', 0)
ON CONFLICT DO NOTHING;
