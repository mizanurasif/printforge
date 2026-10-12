-- PrintForge schema. Safe to re-run: it drops and recreates every table.
-- WARNING: this deletes all data, including registered users.

DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    name           TEXT        NOT NULL,
    email          TEXT        NOT NULL UNIQUE,
    password_hash  TEXT        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    slug          TEXT PRIMARY KEY,
    display_name  TEXT NOT NULL
);

CREATE TABLE models (
    id           SERIAL PRIMARY KEY,
    name         TEXT        NOT NULL,
    description  TEXT        NOT NULL,
    likes        INTEGER     NOT NULL DEFAULT 0,
    image        TEXT        NOT NULL,
    category     TEXT        NOT NULL REFERENCES categories(slug),
    date_added   TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id      INTEGER     REFERENCES users(id) ON DELETE SET NULL
);

-- Speeds up "models by this user" (profile page, dashboard)
CREATE INDEX models_user_id_idx ON models(user_id);
-- Speeds up category pages
CREATE INDEX models_category_idx ON models(category);