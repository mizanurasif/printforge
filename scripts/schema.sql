-- PrintForge schema. Safe to re-run: it drops and recreates every table.
-- WARNING: this deletes all data, including registered users.

DROP TABLE IF EXISTS likes;
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
    model_file   TEXT,                   -- URL of a .glb in /public, or NULL for image-only models
    category     TEXT        NOT NULL REFERENCES categories(slug),
    date_added   TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id      INTEGER     REFERENCES users(id) ON DELETE SET NULL
);

-- One row per (user, model): the primary key makes a duplicate like impossible.
-- models.likes stays as a stored count, kept in sync by the like action.
CREATE TABLE likes (
    user_id     INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    model_id    INTEGER     NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, model_id)
);

-- Speeds up "models by this user" (profile page, dashboard)
CREATE INDEX models_user_id_idx ON models(user_id);
-- Speeds up category pages
CREATE INDEX models_category_idx ON models(category);
-- Speeds up "who liked this model" and the cascade when a model is deleted
CREATE INDEX likes_model_id_idx ON likes(model_id);
