"""
Авторизация пользователей NexChat: регистрация, вход, выход, проверка сессии.
Роутинг через поле action в теле запроса: register | login | me | logout
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p84185936_casino_app_developme")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_token() -> str:
    return secrets.token_hex(48)


def ok(data: dict):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}


def err(msg: str, code: int = 400):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action", "")
    token = (event.get("headers") or {}).get("X-Auth-Token", "")

    # --- REGISTER ---
    if action == "register":
        username = (body.get("username") or "").strip()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not username or not email or not password:
            return err("Заполните все поля")
        if len(username) < 3:
            return err("Имя пользователя минимум 3 символа")
        if len(password) < 6:
            return err("Пароль минимум 6 символов")

        words = username.split()
        avatar = "".join([w[0].upper() for w in words[:2]]) if words else username[:2].upper()
        pw_hash = hash_password(password)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM " + SCHEMA + ".users WHERE username = %s OR email = %s",
            (username, email)
        )
        if cur.fetchone():
            cur.close(); conn.close()
            return err("Пользователь с таким именем или email уже существует", 409)

        cur.execute(
            "INSERT INTO " + SCHEMA + ".users (username, email, password_hash, avatar_text) VALUES (%s, %s, %s, %s) RETURNING id",
            (username, email, pw_hash, avatar)
        )
        user_id = cur.fetchone()[0]
        new_token = make_token()
        cur.execute(
            "INSERT INTO " + SCHEMA + ".sessions (user_id, token) VALUES (%s, %s)",
            (user_id, new_token)
        )
        conn.commit(); cur.close(); conn.close()
        return ok({
            "token": new_token,
            "user": {"id": user_id, "username": username, "email": email, "avatar_text": avatar, "status_text": "👋 В NexChat"}
        })

    # --- LOGIN ---
    if action == "login":
        login = (body.get("login") or "").strip().lower()
        password = body.get("password") or ""

        if not login or not password:
            return err("Введите логин и пароль")

        pw_hash = hash_password(password)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, email, avatar_text, status_text FROM " + SCHEMA + ".users "
            "WHERE (username = %s OR email = %s) AND password_hash = %s",
            (login, login, pw_hash)
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return err("Неверный логин или пароль", 401)

        user_id, username, email, avatar_text, status_text = row
        new_token = make_token()
        cur.execute("INSERT INTO " + SCHEMA + ".sessions (user_id, token) VALUES (%s, %s)", (user_id, new_token))
        cur.execute("UPDATE " + SCHEMA + ".users SET online = true, updated_at = now() WHERE id = %s", (user_id,))
        conn.commit(); cur.close(); conn.close()
        return ok({
            "token": new_token,
            "user": {"id": user_id, "username": username, "email": email, "avatar_text": avatar_text, "status_text": status_text}
        })

    # --- ME ---
    if action == "me":
        if not token:
            return err("Нет токена", 401)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT u.id, u.username, u.email, u.avatar_text, u.status_text "
            "FROM " + SCHEMA + ".sessions s "
            "JOIN " + SCHEMA + ".users u ON u.id = s.user_id "
            "WHERE s.token = %s AND s.expires_at > now()",
            (token,)
        )
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return err("Сессия устарела", 401)
        user_id, username, email, avatar_text, status_text = row
        return ok({"user": {"id": user_id, "username": username, "email": email, "avatar_text": avatar_text, "status_text": status_text}})

    # --- LOGOUT ---
    if action == "logout":
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("SELECT user_id FROM " + SCHEMA + ".sessions WHERE token = %s", (token,))
            row = cur.fetchone()
            if row:
                cur.execute("UPDATE " + SCHEMA + ".users SET online = false, updated_at = now() WHERE id = %s", (row[0],))
                cur.execute("UPDATE " + SCHEMA + ".sessions SET expires_at = now() WHERE token = %s", (token,))
            conn.commit(); cur.close(); conn.close()
        return ok({"ok": True})

    return err("Неизвестное действие")