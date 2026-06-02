"""
Чаты и сообщения NexChat.
Действия: list_chats, get_messages, send_message, find_users, open_chat
"""
import json
import os
import psycopg2

S = os.environ.get("MAIN_DB_SCHEMA", "t_p84185936_casino_app_developme")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def auth(event):
    token = (event.get("headers") or {}).get("X-Auth-Token", "")
    if not token:
        return None, None
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.username, u.avatar_text FROM " + S + ".sessions s "
        "JOIN " + S + ".users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > now()",
        (token,)
    )
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return None, None
    return row[0], {"id": row[0], "username": row[1], "avatar_text": row[2]}


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
    user_id, me = auth(event)
    if not user_id:
        return err("Необходима авторизация", 401)

    # --- LIST CHATS ---
    if action == "list_chats":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                c.id,
                c.is_group,
                CASE WHEN c.is_group THEN c.name
                     ELSE (SELECT u2.username FROM """ + S + """.chat_members cm2
                           JOIN """ + S + """.users u2 ON u2.id = cm2.user_id
                           WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1)
                END as display_name,
                CASE WHEN c.is_group THEN ''
                     ELSE (SELECT u2.avatar_text FROM """ + S + """.chat_members cm2
                           JOIN """ + S + """.users u2 ON u2.id = cm2.user_id
                           WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1)
                END as avatar_text,
                CASE WHEN c.is_group THEN 0
                     ELSE (SELECT u2.id FROM """ + S + """.chat_members cm2
                           JOIN """ + S + """.users u2 ON u2.id = cm2.user_id
                           WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1)
                END as other_user_id,
                (SELECT m.text FROM """ + S + """.messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                (SELECT m.created_at FROM """ + S + """.messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_at,
                (SELECT u2.online FROM """ + S + """.chat_members cm2
                 JOIN """ + S + """.users u2 ON u2.id = cm2.user_id
                 WHERE cm2.chat_id = c.id AND cm2.user_id != %s AND NOT c.is_group LIMIT 1) as online
            FROM """ + S + """.chats c
            JOIN """ + S + """.chat_members cm ON cm.chat_id = c.id AND cm.user_id = %s
            ORDER BY last_at DESC NULLS LAST
        """, (user_id, user_id, user_id, user_id, user_id))
        rows = cur.fetchall()
        cur.close(); conn.close()
        chats = []
        for r in rows:
            chats.append({
                "id": r[0],
                "is_group": r[1],
                "name": r[2] or "Без названия",
                "avatar_text": r[3] or "?",
                "other_user_id": r[4],
                "last_message": r[5] or "",
                "last_at": str(r[6]) if r[6] else "",
                "online": bool(r[7]) if r[7] is not None else False,
            })
        return ok({"chats": chats})

    # --- GET MESSAGES ---
    if action == "get_messages":
        chat_id = body.get("chat_id")
        if not chat_id:
            return err("chat_id обязателен")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM " + S + ".chat_members WHERE chat_id = %s AND user_id = %s",
            (chat_id, user_id)
        )
        if not cur.fetchone():
            cur.close(); conn.close()
            return err("Нет доступа к чату", 403)
        cur.execute(
            "SELECT m.id, m.sender_id, u.username, u.avatar_text, m.text, m.created_at "
            "FROM " + S + ".messages m "
            "JOIN " + S + ".users u ON u.id = m.sender_id "
            "WHERE m.chat_id = %s ORDER BY m.created_at ASC LIMIT 100",
            (chat_id,)
        )
        rows = cur.fetchall()
        cur.close(); conn.close()
        msgs = []
        for r in rows:
            msgs.append({
                "id": r[0],
                "sender_id": r[1],
                "sender_name": r[2],
                "sender_avatar": r[3],
                "text": r[4],
                "created_at": str(r[5]),
                "is_out": r[1] == user_id,
            })
        return ok({"messages": msgs})

    # --- SEND MESSAGE ---
    if action == "send_message":
        chat_id = body.get("chat_id")
        text = (body.get("text") or "").strip()
        if not chat_id or not text:
            return err("chat_id и text обязательны")
        if len(text) > 4000:
            return err("Сообщение слишком длинное")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM " + S + ".chat_members WHERE chat_id = %s AND user_id = %s",
            (chat_id, user_id)
        )
        if not cur.fetchone():
            cur.close(); conn.close()
            return err("Нет доступа к чату", 403)
        cur.execute(
            "INSERT INTO " + S + ".messages (chat_id, sender_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (chat_id, user_id, text)
        )
        msg_id, created_at = cur.fetchone()
        cur.execute("UPDATE " + S + ".users SET online = true, updated_at = now() WHERE id = %s", (user_id,))
        conn.commit(); cur.close(); conn.close()
        return ok({
            "message": {
                "id": msg_id,
                "chat_id": chat_id,
                "sender_id": user_id,
                "sender_name": me["username"],
                "sender_avatar": me["avatar_text"],
                "text": text,
                "created_at": str(created_at),
                "is_out": True,
            }
        })

    # --- FIND USERS (поиск для создания чата) ---
    if action == "find_users":
        query = (body.get("query") or "").strip()
        if len(query) < 2:
            return err("Введите минимум 2 символа")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, avatar_text, online FROM " + S + ".users "
            "WHERE id != %s AND (username ILIKE %s OR email ILIKE %s) LIMIT 20",
            (user_id, f"%{query}%", f"%{query}%")
        )
        rows = cur.fetchall()
        cur.close(); conn.close()
        return ok({"users": [{"id": r[0], "username": r[1], "avatar_text": r[2], "online": r[3]} for r in rows]})

    # --- OPEN CHAT (создать или открыть личный чат) ---
    if action == "open_chat":
        other_id = body.get("other_user_id")
        if not other_id or other_id == user_id:
            return err("Некорректный пользователь")
        conn = get_conn()
        cur = conn.cursor()
        # Check if DM already exists
        cur.execute("""
            SELECT c.id FROM """ + S + """.chats c
            JOIN """ + S + """.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
            JOIN """ + S + """.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
            WHERE NOT c.is_group
            LIMIT 1
        """, (user_id, other_id))
        row = cur.fetchone()
        if row:
            cur.close(); conn.close()
            return ok({"chat_id": row[0]})
        # Create new chat
        cur.execute("INSERT INTO " + S + ".chats (is_group) VALUES (false) RETURNING id")
        chat_id = cur.fetchone()[0]
        cur.execute("INSERT INTO " + S + ".chat_members (chat_id, user_id) VALUES (%s, %s), (%s, %s)",
                    (chat_id, user_id, chat_id, other_id))
        conn.commit(); cur.close(); conn.close()
        return ok({"chat_id": chat_id})

    return err("Неизвестное действие")
