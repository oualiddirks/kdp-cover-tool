CREATE TABLE IF NOT EXISTS covers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  page_count INTEGER NOT NULL,
  paper_type TEXT NOT NULL CHECK (paper_type IN ('white', 'cream', 'color')),
  trim_size TEXT NOT NULL,
  cover_finish TEXT NOT NULL CHECK (cover_finish IN ('matte', 'glossy')),
  back_cover_text TEXT,
  spine_width DECIMAL(10,6),
  full_width DECIMAL(10,6),
  full_height DECIMAL(10,6),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'complete', 'failed')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE covers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own covers"
  ON covers FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  covers_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
