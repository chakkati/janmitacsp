-- JanMitra AI Database Schema
-- Designed for Supabase / PostgreSQL

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Profiles Table (Extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- Matches auth.users.id
    full_name VARCHAR(255),
    phone_number VARCHAR(15),
    age INT,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Transgender', 'Other')),
    caste_category VARCHAR(50) CHECK (caste_category IN ('General', 'OBC', 'SC', 'ST', 'EBC', 'Other')),
    occupation VARCHAR(100), -- Student, Farmer, Job Seeker, Women/Homemaker, Senior Citizen, Entrepreneur, Disabled, General
    annual_income NUMERIC(12, 2) DEFAULT 0.00,
    is_disabled BOOLEAN DEFAULT FALSE,
    disability_percentage INT DEFAULT 0 CHECK (disability_percentage >= 0 AND disability_percentage <= 100),
    is_farmer BOOLEAN DEFAULT FALSE,
    marital_status VARCHAR(50) CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Andhra Pradesh',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Schemes Table
CREATE TABLE schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    benefits_summary TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    official_website VARCHAR(255),
    helpline VARCHAR(100),
    district_availability TEXT[], -- Array of districts, or NULL/['All'] for state-wide
    pdf_source_url VARCHAR(512),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Eligibility Rules Table (Rule Engine)
CREATE TABLE eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL, -- e.g., 'age', 'annual_income', 'gender', 'caste_category', 'is_disabled', 'is_farmer'
    operator VARCHAR(20) NOT NULL, -- e.g., '>=', '<=', '=', 'IN', 'NOT IN', 'BOOLEAN'
    rule_value TEXT NOT NULL, -- The value to compare against (e.g., '18', '250000', '["SC", "ST"]')
    error_message TEXT, -- Explanation of why they fail this rule (e.g., 'Annual income must be below Rs. 2.5 Lakhs')
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'AADHAAR', 'INCOME_CERT', 'RATION_CARD'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Scheme Documents Junction Table (Many-to-Many)
CREATE TABLE scheme_documents (
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (scheme_id, document_id)
);

-- 8. Saved Schemes Table (Bookmarks)
CREATE TABLE saved_schemes (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, scheme_id)
);

-- 9. Chat Sessions Table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB, -- JSON structure listing official URLs and snippets
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Feedback Table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    rating INT CHECK (rating IN (1, -1)), -- Thumbs up (1) or Thumbs down (-1)
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Admins Table
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('super_admin', 'department_admin')) DEFAULT 'department_admin',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Analytics Events Table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'scheme_view', 'eligibility_check', 'ocr_scan', 'voice_search'
    entity_id VARCHAR(255), -- ID of the scheme, message, etc.
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update `updated_at` column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_schemes_modtime BEFORE UPDATE ON schemes FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_eligibility_rules_modtime BEFORE UPDATE ON eligibility_rules FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_chat_sessions_modtime BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_admins_modtime BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Indexes for performance optimization
CREATE INDEX idx_schemes_category ON schemes(category_id);
CREATE INDEX idx_schemes_department ON schemes(department_id);
CREATE INDEX idx_eligibility_rules_scheme ON eligibility_rules(scheme_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
