-- ============================================================
-- Campus Event Discovery Platform 
-- ============================================================

-- ----------------------------
-- ENUM TYPES
-- ----------------------------

CREATE TYPE role_enum AS ENUM ('student', 'organizer', 'admin');

CREATE TYPE account_status_enum AS ENUM ('pending', 'approved', 'rejected', 'suspended');

CREATE TYPE school_enum AS ENUM (
    'SBASSE - Syed Babar Ali School of Science and Engineering',
    'SDSB - Suleiman Dawood School of Business',
    'MGHSS - Mushtaq Gurmani School of Humanities and Social Sciences',
    'SAHSOL - Sheikh Ahmad Hassan School of Law'
);

CREATE TYPE event_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');

CREATE TYPE rsvp_status_enum AS ENUM ('going', 'interested', 'waitlisted', 'cancelled');

CREATE TYPE notification_type_enum AS ENUM (
    'event_approved',
    'event_rejected',
    'account_approved',
    'account_rejected',
    'account_suspended',
    'waitlist_promoted',
    'event_updated',
    'event_cancelled',
    'event_reminder'
);

-- ----------------------------
-- CORE IDENTITY
-- ----------------------------

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    picture_url TEXT,
    role role_enum NOT NULL,
    account_status account_status_enum NOT NULL DEFAULT 'pending',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Student (
    student_id INTEGER PRIMARY KEY REFERENCES Users(id),
    roll_number INTEGER UNIQUE NOT NULL,
    school school_enum NOT NULL
);

CREATE TABLE Organization (
    organization_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Organiser (
    organiser_id INTEGER PRIMARY KEY REFERENCES Users(id),
    organization_id INTEGER NOT NULL REFERENCES Organization(organization_id)
);

CREATE TABLE Admin (
    admin_id INTEGER PRIMARY KEY REFERENCES Users(id),
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_admin_id INTEGER REFERENCES Users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- CATEGORY / INTEREST (kept separate per design discussion)
-- ----------------------------

CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Interest (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Student_Interest (
    student_id INTEGER NOT NULL REFERENCES Student(student_id),
    interest_id INTEGER NOT NULL REFERENCES Interest(id),
    PRIMARY KEY (student_id, interest_id)
);

-- ----------------------------
-- EVENTS
-- ----------------------------
-- Denormalized snapshot: captures the organizer's organization_id at event creation time.
-- Intentionally NOT derived via Organizer.organization_id join, since an organizer
-- switching organizations later should not retroactively change attribution of past events.
-- organization_id INTEGER NOT NULL REFERENCES Organization(organization_id),

CREATE TABLE Event (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES Category(id),
    organizer_id INTEGER NOT NULL REFERENCES Organiser(organiser_id),
    organization_id INTEGER NOT NULL REFERENCES Organization(organization_id)
    venue_name TEXT,
    address TEXT,
    poster_url TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_capacity INTEGER,
    status event_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- REGISTRATIONS (RSVP)
-- ----------------------------

CREATE TABLE Registration (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES Student(student_id),
    event_id INTEGER NOT NULL REFERENCES Event(id),
    status rsvp_status_enum NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, event_id)
);

-- ----------------------------
-- NOTIFICATIONS
-- ----------------------------

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    related_event_id INTEGER REFERENCES Event(id),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Push_Subscription (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    endpoint TEXT UNIQUE NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- PLATFORM SETTINGS
-- ----------------------------

CREATE TABLE Platform_Settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by_admin_id INTEGER REFERENCES Users(id)
);

CREATE TABLE Allowed_Domains (
    id SERIAL PRIMARY KEY,
    domain TEXT UNIQUE NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- AUDIT LOGS
-- ----------------------------

CREATE TABLE Account_Status_Log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    changed_by_admin_id INTEGER NOT NULL REFERENCES Users(id),
    old_status account_status_enum,
    new_status account_status_enum NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Event_Status_Log (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES Event(id),
    changed_by_admin_id INTEGER NOT NULL REFERENCES Users(id),
    old_status event_status_enum,
    new_status event_status_enum NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Platform_Settings_Log (
    id SERIAL PRIMARY KEY,
    setting_key TEXT NOT NULL,
    changed_by_admin_id INTEGER NOT NULL REFERENCES Users(id),
    old_value JSONB,
    new_value JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------
-- AUTH / SECURITY
-- ----------------------------

CREATE TABLE Email_Verification_Token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Password_Reset_Token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Refresh_Token (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Login_Attempt (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    email TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address TEXT,
    attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);