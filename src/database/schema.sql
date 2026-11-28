CREATE TABLE IF NOT EXISTS roles (
  id   SMALLSERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
       CHECK (name IN ('admin', 'moderator', 'user'))
);

INSERT INTO roles (name)
VALUES ('admin'), ('moderator'), ('user')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role_id       SMALLINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  username      VARCHAR(30)  NOT NULL,
  email         VARCHAR(254) NOT NULL,
  password_hash TEXT         NOT NULL,
  friend_code   CHAR(8)      NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ===== CATEGORY LOOKUPS =====
CREATE TABLE IF NOT EXISTS spell_schools (
  id         SMALLSERIAL PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  is_core    BOOLEAN NOT NULL DEFAULT FALSE,   -- TRUE = original 5e set
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS spell_schools_name_idx ON spell_schools (LOWER(name));
INSERT INTO spell_schools (name, is_core) VALUES
  ('Abjuration', TRUE), ('Conjuration', TRUE), ('Divination', TRUE), ('Enchantment', TRUE),
  ('Evocation', TRUE), ('Illusion', TRUE), ('Necromancy', TRUE), ('Transmutation', TRUE)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS item_types (
  id         SMALLSERIAL PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  is_core    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS item_types_name_idx ON item_types (LOWER(name));
INSERT INTO item_types (name, is_core) VALUES
  ('Weapon', TRUE), ('Armor', TRUE), ('Potion', TRUE), ('Ring', TRUE), ('Rod', TRUE),
  ('Scroll', TRUE), ('Staff', TRUE), ('Wand', TRUE), ('Wondrous Item', TRUE), ('Adventuring Gear', TRUE)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS creature_types (
  id         SMALLSERIAL PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  is_core    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS creature_types_name_idx ON creature_types (LOWER(name));
INSERT INTO creature_types (name, is_core) VALUES
  ('Aberration', TRUE), ('Beast', TRUE), ('Celestial', TRUE), ('Construct', TRUE), ('Dragon', TRUE),
  ('Elemental', TRUE), ('Fey', TRUE), ('Fiend', TRUE), ('Giant', TRUE), ('Humanoid', TRUE),
  ('Monstrosity', TRUE), ('Ooze', TRUE), ('Plant', TRUE), ('Undead', TRUE)
ON CONFLICT DO NOTHING;

-- "Other" → real category requests (workflow UI comes with the moderation commits)
CREATE TABLE IF NOT EXISTS category_requests (
  id             SERIAL PRIMARY KEY,
  kind           VARCHAR(20) NOT NULL
                 CHECK (kind IN ('spell_school', 'item_type', 'creature_type')),
  proposed_name  VARCHAR(40) NOT NULL,
  reason         TEXT NOT NULL,
  requested_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status         VARCHAR(10) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  moderator_note TEXT,
  reviewed_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ
);
-- only one pending request per name per kind
CREATE UNIQUE INDEX IF NOT EXISTS category_requests_pending_idx
  ON category_requests (kind, LOWER(proposed_name)) WHERE status = 'pending';


-- ===== ENTRIES =====
CREATE TABLE IF NOT EXISTS spells (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copied_from   INTEGER REFERENCES spells(id) ON DELETE SET NULL,
  name          VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  visibility    VARCHAR(10) NOT NULL DEFAULT 'private'
                CHECK (visibility IN ('private', 'public', 'hidden')),
  is_official   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level         SMALLINT NOT NULL CHECK (level BETWEEN 0 AND 9),  -- 0 = cantrip
  school_id     SMALLINT REFERENCES spell_schools(id) ON DELETE RESTRICT,
  school_other  VARCHAR(40),
  casting_time  VARCHAR(50) NOT NULL,
  range_text    VARCHAR(50) NOT NULL,
  verbal        BOOLEAN NOT NULL DEFAULT FALSE,
  somatic       BOOLEAN NOT NULL DEFAULT FALSE,
  material      VARCHAR(200),              -- NULL = no material component
  duration      VARCHAR(50) NOT NULL,
  concentration BOOLEAN NOT NULL DEFAULT FALSE,
  ritual        BOOLEAN NOT NULL DEFAULT FALSE,
  higher_levels TEXT,  
  CONSTRAINT spells_school_one CHECK ((school_id IS NULL) <> (school_other IS NULL))
);

CREATE TABLE IF NOT EXISTS items (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copied_from   INTEGER REFERENCES items(id) ON DELETE SET NULL,
  name          VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  visibility    VARCHAR(10) NOT NULL DEFAULT 'private'
                CHECK (visibility IN ('private', 'public', 'hidden')),
  is_official   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  item_type_id    SMALLINT REFERENCES item_types(id) ON DELETE RESTRICT,
  item_type_other VARCHAR(40),
  rarity        VARCHAR(10) NOT NULL CHECK (rarity IN ('common','uncommon','rare',
                  'very rare','legendary','artifact')),
  requires_attunement BOOLEAN NOT NULL DEFAULT FALSE,
  attunement_note     VARCHAR(100),        -- e.g. "by a cleric"
  weight_lb     NUMERIC(7,2) CHECK (weight_lb >= 0),
  cost_gp       NUMERIC(12,2) CHECK (cost_gp >= 0),
  CONSTRAINT items_type_one CHECK ((item_type_id IS NULL) <> (item_type_other IS NULL))
);

CREATE TABLE IF NOT EXISTS monsters (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copied_from   INTEGER REFERENCES monsters(id) ON DELETE SET NULL,
  name          VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  visibility    VARCHAR(10) NOT NULL DEFAULT 'private'
                CHECK (visibility IN ('private', 'public', 'hidden')),
  is_official   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  size          VARCHAR(10) NOT NULL CHECK (size IN ('tiny','small','medium','large','huge','gargantuan')),
  creature_type_id    SMALLINT REFERENCES creature_types(id) ON DELETE RESTRICT,
  creature_type_other VARCHAR(40),
  alignment     VARCHAR(30),
  armor_class   SMALLINT NOT NULL CHECK (armor_class BETWEEN 1 AND 30),
  hit_points    INTEGER NOT NULL CHECK (hit_points > 0),
  hit_dice      VARCHAR(20),               -- e.g. "8d10 + 16"
  speed         VARCHAR(100) NOT NULL,     -- e.g. "30 ft., fly 60 ft."
  str_score     SMALLINT NOT NULL CHECK (str_score BETWEEN 1 AND 30),
  dex_score     SMALLINT NOT NULL CHECK (dex_score BETWEEN 1 AND 30),
  con_score     SMALLINT NOT NULL CHECK (con_score BETWEEN 1 AND 30),
  int_score     SMALLINT NOT NULL CHECK (int_score BETWEEN 1 AND 30),
  wis_score     SMALLINT NOT NULL CHECK (wis_score BETWEEN 1 AND 30),
  cha_score     SMALLINT NOT NULL CHECK (cha_score BETWEEN 1 AND 30),
  challenge_rating NUMERIC(6,3) NOT NULL CHECK (
                  challenge_rating IN (0, 0.125, 0.25, 0.5)
                  OR (challenge_rating BETWEEN 1 AND 30 AND challenge_rating = TRUNC(challenge_rating))),
  traits        TEXT,
  actions       TEXT,
  CONSTRAINT monsters_creature_type_one CHECK ((creature_type_id IS NULL) <> (creature_type_other IS NULL))
);

CREATE TABLE IF NOT EXISTS character_classes (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copied_from   INTEGER REFERENCES character_classes(id) ON DELETE SET NULL,
  name          VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  visibility    VARCHAR(10) NOT NULL DEFAULT 'private'
                CHECK (visibility IN ('private', 'public', 'hidden')),
  is_official   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hit_die       SMALLINT NOT NULL CHECK (hit_die IN (6, 8, 10, 12)),
  primary_ability      VARCHAR(50) NOT NULL,
  saving_throws        VARCHAR(50) NOT NULL,
  armor_proficiencies  VARCHAR(200),
  weapon_proficiencies VARCHAR(200),
  skill_choices        VARCHAR(200),
  spellcasting_ability VARCHAR(3) CHECK (spellcasting_ability IN ('int','wis','cha')),  -- NULL = non-caster
  features      TEXT
);

CREATE TABLE IF NOT EXISTS character_races (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copied_from   INTEGER REFERENCES character_races(id) ON DELETE SET NULL,
  name          VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  visibility    VARCHAR(10) NOT NULL DEFAULT 'private'
                CHECK (visibility IN ('private', 'public', 'hidden')),
  is_official   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  size          VARCHAR(10) NOT NULL CHECK (size IN ('small','medium')),
  speed         SMALLINT NOT NULL CHECK (speed BETWEEN 0 AND 120),
  ability_bonuses VARCHAR(100) NOT NULL,   -- e.g. "+2 Dex, +1 Wis"
  darkvision    SMALLINT NOT NULL DEFAULT 0 CHECK (darkvision >= 0),
  languages     VARCHAR(200),
  traits        TEXT
);

-- Postgres doesn't index foreign keys automatically; "my entries" and browse need these
CREATE INDEX IF NOT EXISTS spells_owner_idx     ON spells (owner_id);
CREATE INDEX IF NOT EXISTS items_owner_idx      ON items (owner_id);
CREATE INDEX IF NOT EXISTS monsters_owner_idx   ON monsters (owner_id);
CREATE INDEX IF NOT EXISTS classes_owner_idx    ON character_classes (owner_id);
CREATE INDEX IF NOT EXISTS races_owner_idx      ON character_races (owner_id);
CREATE INDEX IF NOT EXISTS spells_visibility_idx   ON spells (visibility);
CREATE INDEX IF NOT EXISTS items_visibility_idx    ON items (visibility);
CREATE INDEX IF NOT EXISTS monsters_visibility_idx ON monsters (visibility);
CREATE INDEX IF NOT EXISTS classes_visibility_idx  ON character_classes (visibility);
CREATE INDEX IF NOT EXISTS races_visibility_idx    ON character_races (visibility);



CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx    ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (LOWER(username));