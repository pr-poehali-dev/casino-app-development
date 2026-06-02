
CREATE TABLE t_p84185936_casino_app_developme.users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(40) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_text VARCHAR(4) NOT NULL DEFAULT '',
  status_text VARCHAR(120) NOT NULL DEFAULT '👋 В NexChat',
  online      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE t_p84185936_casino_app_developme.sessions (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES t_p84185936_casino_app_developme.users(id),
  token      VARCHAR(128) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days'
);

CREATE INDEX idx_sessions_token ON t_p84185936_casino_app_developme.sessions(token);
CREATE INDEX idx_sessions_user_id ON t_p84185936_casino_app_developme.sessions(user_id);
