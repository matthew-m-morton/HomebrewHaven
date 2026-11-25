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

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx    ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (LOWER(username));