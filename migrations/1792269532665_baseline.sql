-- Up Migration
-- The schema as it was when migrations were introduced (same as the old scripts/schema.sql).
-- Every later change goes in a new migration: npm run db:migrate:create <name>

CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    name           TEXT        NOT NULL,
    email          TEXT        NOT NULL UNIQUE,
    password_hash  TEXT        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    slug          TEXT PRIMARY KEY,
    display_name  TEXT UNIQUE NOT NULL
);

CREATE TABLE models (
    id           SERIAL PRIMARY KEY,
    name         TEXT        NOT NULL,
    description  TEXT        NOT NULL,
    likes        INTEGER     NOT NULL DEFAULT 0,
    image        TEXT        NOT NULL,
    model_file   TEXT,                   -- URL of the .glb in /public; NULL only while its upload is in progress
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

-- Down Migration

DROP TABLE likes;
DROP TABLE models;
DROP TABLE categories;
DROP TABLE users;
