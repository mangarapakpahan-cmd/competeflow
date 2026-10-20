-- ==============================================================================
-- CompeteFlow Database Schema (Supabase PostgreSQL)
-- Multi-Stage Competition, Task Management, Vault, Budget, and Retrospective
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE competition_status AS ENUM (
    'draft',        -- Baru didata, belum resmi daftar
    'registered',   -- Sudah daftar / bayar, sedang persiapan
    'in_progress',  -- Berjalan (tahap penyisihan / seleksi berkas)
    'finalist',     -- Lolos ke babak semifinal / final
    'completed',    -- Selesai, menunggu hasil / sudah diumumkan
    'archived'      -- Diarsipkan
);

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE task_category AS ENUM ('competition', 'college', 'work', 'personal');

CREATE TYPE link_type AS ENUM ('drive', 'figma', 'github', 'docs', 'portal', 'other');

CREATE TYPE expense_type AS ENUM ('registration', 'operational', 'prize', 'reimbursement');

CREATE TYPE competition_level AS ENUM ('university', 'regional', 'national', 'international');

CREATE TYPE final_result_type AS ENUM (
    'champion_1',
    'champion_2',
    'champion_3',
    'runner_up',
    'finalist',
    'semifinalist',
    'participant',
    'honorable_mention'
);

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Sync with Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    telegram_chat_id TEXT,
    telegram_username TEXT,
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. COMPETITIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g. KTI, UI/UX, Business Plan, Hackathon
    level competition_level DEFAULT 'national' NOT NULL,
    status competition_status DEFAULT 'draft' NOT NULL,
    official_url TEXT,
    contact_person TEXT,
    notes TEXT,
    registration_fee NUMERIC(12, 2) DEFAULT 0.00,
    target_prize NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. COMPETITION STAGES / MILESTONES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL, -- e.g. "Pendaftaran & Berkas", "Submit Tahap 1", "Pengumuman Final", "Pitching"
    deadline TIMESTAMPTZ NOT NULL,
    stage_order INT DEFAULT 1 NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. TASKS TABLE (Hybrid: Regular Tasks & Competition Tasks)
-- ------------------------------------------------------------------------------
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    category task_category DEFAULT 'competition' NOT NULL,
    priority task_priority DEFAULT 'medium' NOT NULL,
    due_date TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. COMPETITION LINKS VAULT
-- ------------------------------------------------------------------------------
CREATE TABLE public.competition_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    link_type link_type DEFAULT 'drive' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. COMPETITION FILES & VAULT (Supabase Storage reference)
-- ------------------------------------------------------------------------------
CREATE TABLE public.competition_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE, -- nullable if general document (e.g. Scan KTM)
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    file_category VARCHAR(100) DEFAULT 'other', -- 'juknis', 'proposal', 'ktm', 'cv', 'surat_orisinalitas', 'karya'
    is_general_asset BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. EXPENSES & PRIZE TRACKER
-- ------------------------------------------------------------------------------
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    type expense_type DEFAULT 'registration' NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. RETROSPECTIVES & ACHIEVEMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE public.retrospectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID UNIQUE NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    final_result final_result_type NOT NULL,
    prize_amount NUMERIC(12, 2) DEFAULT 0.00,
    certificate_file_path TEXT,
    what_went_well TEXT,
    what_to_improve TEXT,
    judge_feedback TEXT,
    tags TEXT[], -- e.g. ['Pitching', 'UI/UX', 'Prototype']
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATION LOGS (Telegram / WhatsApp)
-- ------------------------------------------------------------------------------
CREATE TABLE public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    channel VARCHAR(50) DEFAULT 'telegram' NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'D-7', 'D-3', 'D-1', 'D-0', 'daily_digest'
    message_sent TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status VARCHAR(50) DEFAULT 'delivered' NOT NULL
);

-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ------------------------------------------------------------------------------
CREATE INDEX idx_competitions_user_status ON public.competitions (user_id, status);
CREATE INDEX idx_stages_user_deadline ON public.stages (user_id, deadline ASC) WHERE is_completed = false;
CREATE INDEX idx_tasks_user_due_priority ON public.tasks (user_id, is_completed, due_date ASC, priority DESC);
CREATE INDEX idx_tasks_competition ON public.tasks (competition_id);
CREATE INDEX idx_expenses_competition ON public.expenses (competition_id);
CREATE INDEX idx_files_user ON public.competition_files (user_id);

-- ------------------------------------------------------------------------------
-- 12. TRIGGERS & FUNCTIONS
-- ------------------------------------------------------------------------------

-- Function: Auto-create Profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On auth user created
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitions_timestamp
    BEFORE UPDATE ON public.competitions
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER update_tasks_timestamp
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER update_retrospectives_timestamp
    BEFORE UPDATE ON public.retrospectives
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Competitions: CRUD scoped to user_id
CREATE POLICY "Users can manage own competitions" ON public.competitions
    FOR ALL USING (auth.uid() = user_id);

-- Stages: CRUD scoped to user_id
CREATE POLICY "Users can manage own stages" ON public.stages
    FOR ALL USING (auth.uid() = user_id);

-- Tasks: CRUD scoped to user_id
CREATE POLICY "Users can manage own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

-- Competition Links: CRUD scoped to user_id
CREATE POLICY "Users can manage own competition links" ON public.competition_links
    FOR ALL USING (auth.uid() = user_id);

-- Competition Files: CRUD scoped to user_id
CREATE POLICY "Users can manage own competition files" ON public.competition_files
    FOR ALL USING (auth.uid() = user_id);

-- Expenses: CRUD scoped to user_id
CREATE POLICY "Users can manage own expenses" ON public.expenses
    FOR ALL USING (auth.uid() = user_id);

-- Retrospectives: CRUD scoped to user_id
CREATE POLICY "Users can manage own retrospectives" ON public.retrospectives
    FOR ALL USING (auth.uid() = user_id);

-- Notification Logs: Read-only for user
CREATE POLICY "Users can view own notification logs" ON public.notification_logs
    FOR SELECT USING (auth.uid() = user_id);
