-- SignalAI Database Schema

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    telegram_id     BIGINT UNIQUE NOT NULL,
    username        VARCHAR(255),
    first_name      VARCHAR(255),
    last_name       VARCHAR(255),
    is_admin        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    title           VARCHAR(300) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(50) DEFAULT 'uncategorized',
    sentiment       VARCHAR(20) DEFAULT 'unknown',
    urgency         INTEGER DEFAULT 3 CHECK (urgency >= 1 AND urgency <= 5),
    keywords        TEXT[] DEFAULT '{}',
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    image_url       VARCHAR(500),
    status          VARCHAR(20) DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    vote_count      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    problem_id      INTEGER NOT NULL REFERENCES problems(id),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_vote_count ON problems(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_problems_urgency ON problems(urgency DESC);
CREATE INDEX IF NOT EXISTS idx_problems_location ON problems(lat, lng);
CREATE INDEX IF NOT EXISTS idx_votes_problem_id ON votes(problem_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
