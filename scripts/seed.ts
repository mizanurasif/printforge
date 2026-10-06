import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const db = new Database(path.join(root, 'printforge.db'))

// 1. Read the existing JSON data
const models = JSON.parse(
  fs.readFileSync(path.join(root, 'app/data/data.json'), 'utf-8')
)
const categories = JSON.parse(
  fs.readFileSync(path.join(root, 'app/data/categories.json'), 'utf-8')
)

// 2. Create the tables (dropping old ones so the script can be re-run)
db.exec(`
  DROP TABLE IF EXISTS models;
  DROP TABLE IF EXISTS categories;

  CREATE TABLE categories (
    slug        TEXT PRIMARY KEY,
    displayName TEXT NOT NULL
  );

  CREATE TABLE models (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL,
    likes       INTEGER NOT NULL DEFAULT 0,
    image       TEXT    NOT NULL,
    category    TEXT    NOT NULL REFERENCES categories(slug),
    dateAdded   TEXT    NOT NULL
  );
`)

// 3. Prepare the INSERT statements
const insertCategory = db.prepare(
  `INSERT INTO categories (slug, displayName) VALUES (@slug, @displayName)`
)
const insertModel = db.prepare(`
  INSERT INTO models (id, name, description, likes, image, category, dateAdded)
  VALUES (@id, @name, @description, @likes, @image, @category, @dateAdded)
`)

// 4. Insert everything inside one transaction
const seed = db.transaction(() => {
  for (const c of categories) insertCategory.run(c)
  for (const m of models) insertModel.run(m)
})
seed()

console.log(`Seeded ${categories.length} categories and ${models.length} models`)
db.close()