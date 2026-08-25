# 🕵️ SQL Detective

เว็บเกมฝึก SQL แบบ Pick a Card + Drag & Drop SQL Blocks + Run Query

## 1) ติดตั้ง

เปิด Terminal / Command Prompt ในโฟลเดอร์นี้ แล้วรัน:

```bash
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

จากนั้น:

```bash
pip install -r requirements.txt
```

## 2) รันเว็บ

```bash
python app.py
```

เปิดเบราว์เซอร์ไปที่:

http://127.0.0.1:5000

## ฟีเจอร์

- 🎴 Pick a Card สุ่ม CASE
- 🧩 ลาก SQL Blocks ไปประกอบคำตอบ
- 🔀 ลากบล็อกในช่องคำตอบเพื่อเรียงใหม่
- ▶ Run Query เพื่อรัน SQL จริงกับ SQLite
- 📟 แสดงผลลัพธ์เป็นตาราง
- ✅ ตรวจว่าคำตอบตรงกับ CASE หรือไม่
- 🗃 มี Database จำลอง 3 CASE
- 🔒 API อนุญาตเฉพาะ SELECT เพื่อความปลอดภัยของเกม

## หมายเหตุ

ฐานข้อมูล `detective.db` จะถูกสร้าง/รีเซ็ตอัตโนมัติเมื่อเริ่ม `app.py`
