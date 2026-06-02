
CREATE TABLE t_p84185936_casino_app_developme.chats (
  id         SERIAL PRIMARY KEY,
  is_group   BOOLEAN NOT NULL DEFAULT false,
  name       VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE t_p84185936_casino_app_developme.chat_members (
  chat_id    INT NOT NULL REFERENCES t_p84185936_casino_app_developme.chats(id),
  user_id    INT NOT NULL REFERENCES t_p84185936_casino_app_developme.users(id),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE t_p84185936_casino_app_developme.messages (
  id         SERIAL PRIMARY KEY,
  chat_id    INT NOT NULL REFERENCES t_p84185936_casino_app_developme.chats(id),
  sender_id  INT NOT NULL REFERENCES t_p84185936_casino_app_developme.users(id),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_chat_id ON t_p84185936_casino_app_developme.messages(chat_id);
CREATE INDEX idx_chat_members_user_id ON t_p84185936_casino_app_developme.chat_members(user_id);
