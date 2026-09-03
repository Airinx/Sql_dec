from flask import Flask, render_template, request, jsonify
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "detective.db"

app = Flask(__name__)

CASES = {
    "case1": {
        "title": "เจไดไปหนายยยย?",
        "icon": "🐱",
        "difficulty": "⭐⭐⭐",
        "story": "เจไดหายตัวไปจากบริเวณงานอย่างลึกลับ จงค้นหาว่าใครเป็นคนอุ้มเจได และเหตุการณ์เกิดขึ้นที่ไหน",
        "objective": "หาชื่อคนที่อุ้ม Jedi พร้อม action และ location ของเหตุการณ์",
        "guide": "เริ่มจาก events เพื่อหาแถวของ Jedi แล้ว JOIN people ด้วย person_id เพื่อเปลี่ยนรหัสเป็นชื่อคน",
        "result_order": "name → action → location",
        "hint": "ลองค้นหาข้อมูลในตาราง events ที่เกี่ยวข้องกับเจได และเชื่อมกับ people เพื่อดูชื่อคน",
        "tables": {
            "people": {
                "columns": ["id", "name"],
                "rows": [[1, "Anakin"], [2, "OBI-WAN"], [3, "Baby Yoda"], [4, "R2-D2"]],
            },
            "events": {
                "columns": ["id", "person_id", "action", "item", "location"],
                "rows": [
                    [1, 1, "carried", "Jedi", "Lobby"],
                    [2, 2, "looked", "Jedi", "Lobby"],
                    [3, 3, "walked past", "Jedi", "Lobby"],
                    [4, 4, "looked", "Jedi", "Lobby"],
                    [5, 2, "stood near", "Jedi", "Lobby"],
                ],
            },
        },
        "answer_columns": ["name", "action", "location"],
        "blocks": [
            ("SELECT", "keyword"),
            ("p.name", "field"),
            (",", "operator"),
            ("e.action", "field"),
            (",", "operator"),
            ("e.location", "field"),
            ("e.item", "field"),
            ("FROM", "keyword"),
            ("events e", "table"),
            ("JOIN", "keyword"),
            ("people p", "table"),
            ("ON", "keyword"),
            ("e.person_id = p.id", "condition"),
            ("WHERE", "keyword"),
            ("e.item = 'Jedi'", "condition"),
            ("AND", "keyword"),
            ("e.action = 'carried'", "condition"),
            ("e.action = 'looked'", "condition"),
        ],
        "starter": ["SELECT", "p.name", ",", "e.action", ",", "e.location", "FROM", "events e", "JOIN", "people p", "ON", "e.person_id = p.id", "WHERE", "e.item = 'Jedi'", "AND", "e.action = 'carried'"],
    },
    "case2": {
        "title": "ใครขโมยแว่นของ Harry Potter?",
        "icon": "👓",
        "difficulty": "⭐⭐",
        "story": "แว่นของ Harry Potter ถูกวางไว้บนโต๊ะเวลา 15:00 น. แต่เมื่อกลับมาอีกครั้ง แว่นกลับหายไป จงสืบว่าใครเป็นคนขโมย",
        "objective": "หาชื่อคนที่ขโมยแว่นของ Harry Potter",
        "guide": "ดู events ที่ item เป็น Harry Potter glasses แล้ว JOIN people เพื่ออ่านชื่อจาก person_id อย่าสับสนกับคนที่แค่วางหรือมองแว่น",
        "result_order": "person",
        "hint": "ตรวจสอบ action และ item ว่าใครมีข้อมูลเกี่ยวข้องกับแว่น",
        "tables": {
            "people": {
                "columns": ["id", "name"],
                "rows": [[5, "Harry Potter"], [6, "Ron Weasley"], [7, "Hermione Granger"], [8, "Draco Malfoy"]],
            },
            "events": {
                "columns": ["id", "person_id", "action", "item", "location"],
                "rows": [
                    [6, 5, "placed", "Harry Potter glasses", "Table A"],
                    [7, 6, "looked", "Harry Potter glasses", "Table A"],
                    [8, 7, "walked past", "Harry Potter glasses", "Table A"],
                    [9, 8, "took", "Harry Potter glasses", "Table A"],
                    [10, 6, "stood near", "Harry Potter glasses", "Table A"],
                ],
            },
        },
        "answer_columns": ["person"],
        "blocks": [
            ("SELECT", "keyword"),
            ("p.name AS person", "field"),
            ("p.name", "field"),
            ("e.action", "field"),
            ("FROM", "keyword"),
            ("events e", "table"),
            ("JOIN", "keyword"),
            ("people p", "table"),
            ("ON", "keyword"),
            ("e.person_id = p.id", "condition"),
            ("WHERE", "keyword"),
            ("e.item = 'Harry Potter glasses'", "condition"),
            ("AND", "keyword"),
            ("e.action = 'took'", "condition"),
            ("e.action = 'placed'", "condition"),
        ],
        "starter": ["SELECT", "p.name AS person", "FROM", "events e", "JOIN", "people p", "ON", "e.person_id = p.id", "WHERE", "e.item = 'Harry Potter glasses'", "AND", "e.action = 'took'"],
    },
    "case3": {
        "title": "ใครเนียนเป็นเด็ก KDAI?",
        "icon": "👀",
        "difficulty": "⭐",
        "story": "มีคนสแกนบัตรเข้า KDAI แต่ชื่อหนึ่งไม่ได้อยู่ในรายชื่อนักศึกษา KDAI จงหาว่าใครคือคนนั้น",
        "objective": "หาชื่อที่อยู่ใน card_scans แต่ไม่มีอยู่ใน students",
        "guide": "เปรียบเทียบคอลัมน์ name ของสองตารางด้วย subquery และเลือกเฉพาะชื่อที่ไม่พบในรายชื่อนักศึกษา",
        "result_order": "name",
        "hint": "ลองใช้ NOT IN เพื่อเปรียบเทียบ card_scans กับ students",
        "tables": {
            "students": {
                "columns": ["id", "name"],
                "rows": [[1, "Shiro"], [2, "March"], [3, "Kaopun"], [4, "Preem"]],
            },
            "card_scans": {
                "columns": ["id", "name", "location", "scan_time"],
                "rows": [
                    [1, "Shiro", "KDAI Gate", "09:01"],
                    [2, "March", "KDAI Gate", "09:05"],
                    [3, "Kaopun", "KDAI Gate", "09:12"],
                    [4, "Preem", "KDAI Gate", "09:18"],
                    [5, "Indy", "KDAI Gate", "09:21"],
                ],
            },
        },
        "answer_columns": ["name"],
        "blocks": [
            ("SELECT", "keyword"),
            ("name", "field"),
            ("location", "field"),
            ("scan_time", "field"),
            ("FROM", "keyword"),
            ("card_scans", "table"),
            ("WHERE", "keyword"),
            ("name NOT IN (SELECT name FROM students)", "condition"),
            ("name IN (SELECT name FROM students)", "condition"),
        ],
        "starter": ["SELECT", "name", "FROM", "card_scans", "WHERE", "name NOT IN (SELECT name FROM students)"],
    },
}


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.executescript("""
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS people;
    DROP TABLE IF EXISTS students;
    DROP TABLE IF EXISTS card_scans;

    CREATE TABLE people (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
    );

    CREATE TABLE events (
        id INTEGER PRIMARY KEY,
        person_id INTEGER,
        action TEXT,
        item TEXT,
        location TEXT
    );

    CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
    );

    CREATE TABLE card_scans (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        scan_time TEXT
    );

    INSERT INTO people VALUES
        (1, 'Anakin'),
        (2, 'OBI-WAN'),
        (3, 'Baby Yoda'),
        (4, 'R2-D2'),
        (5, 'Harry Potter'),
        (6, 'Ron Weasley'),
        (7, 'Hermione Granger'),
        (8, 'Draco Malfoy');

    INSERT INTO events VALUES
        (1, 1, 'carried', 'Jedi', 'Lobby'),
        (2, 2, 'looked', 'Jedi', 'Lobby'),
        (3, 3, 'walked past', 'Jedi', 'Lobby'),
        (4, 4, 'looked', 'Jedi', 'Lobby'),
        (5, 2, 'stood near', 'Jedi', 'Lobby'),
        (6, 5, 'placed', 'Harry Potter glasses', 'Table A'),
        (7, 6, 'looked', 'Harry Potter glasses', 'Table A'),
        (8, 7, 'walked past', 'Harry Potter glasses', 'Table A'),
        (9, 8, 'took', 'Harry Potter glasses', 'Table A'),
        (10, 6, 'stood near', 'Harry Potter glasses', 'Table A');

    INSERT INTO students VALUES
        (1, 'Shiro'),
        (2, 'March'),
        (3, 'Kaopun'),
        (4, 'Preem');

    INSERT INTO card_scans VALUES
        (1, 'Shiro', 'KDAI Gate', '09:01'),
        (2, 'March', 'KDAI Gate', '09:05'),
        (3, 'Kaopun', 'KDAI Gate', '09:12'),
        (4, 'Preem', 'KDAI Gate', '09:18'),
        (5, 'Indy', 'KDAI Gate', '09:21');
    """)

    conn.commit()
    conn.close()


def get_columns(conn, table):
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return [r[1] for r in rows]


@app.route("/")
def index():
    return render_template("index.html", cases=CASES)


@app.post("/api/run")
def run_query():
    data = request.get_json(silent=True) or {}
    case_id = data.get("case")
    sql = (data.get("sql") or "").strip()

    if case_id not in CASES:
        return jsonify({"ok": False, "error": "ไม่พบ CASE นี้"}), 400

    # เกมนี้ตั้งใจให้ฝึกคำสั่งอ่านข้อมูลเท่านั้น
    if not sql.lower().startswith("select"):
        return jsonify({"ok": False, "error": "SQL Detective อนุญาตเฉพาะ SELECT เท่านั้น"}), 400

    forbidden = ["insert", "update", "delete", "drop", "alter", "create", "attach", "pragma"]
    lowered = sql.lower()
    if any(word in lowered for word in forbidden):
        return jsonify({"ok": False, "error": "คำสั่งนี้ไม่อนุญาตในโหมดฝึกหัด"}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(sql).fetchall()
        columns = [d[0] for d in conn.execute(sql).description] if conn.execute(sql).description else []
        result = [dict(r) for r in rows]

        expected = CASES[case_id]["answer_columns"]
        names = [c.lower() for c in columns]

        correct = False
        if names == expected:
            if case_id == "case1":
                correct = result == [{"name": "Anakin", "action": "carried", "location": "Lobby"}]
            elif case_id == "case2":
                correct = result == [{"person": "Draco Malfoy"}]
            elif case_id == "case3":
                correct = result == [{"name": "Indy"}]

        conn.close()
        return jsonify({
            "ok": True,
            "correct": correct,
            "columns": columns,
            "rows": result,
            "message": "🎉 ถูกต้อง! ไขคดีสำเร็จ" if correct else "ยังไม่ใช่ ลองตรวจสอบ SQL และผลลัพธ์อีกครั้ง"
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400


@app.post("/api/reset")
def reset_db():
    init_db()
    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=True)
