#!/usr/bin/env python3
import http.server
import socketserver
import json
import sqlite3
import os
from urllib.parse import urlparse

PORT = int(os.environ.get('PORT', 8000))
DB_FILE = os.path.join(os.path.dirname(__file__), 'contacts', 'messages.db')

def init_db():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

class SQLitePortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/messages':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, email, subject, message, created_at, is_read FROM messages ORDER BY id DESC')
            rows = cursor.fetchall()
            conn.close()
            
            messages = []
            for row in rows:
                messages.append({
                    'id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'subject': row[3],
                    'message': row[4],
                    'created_at': row[5],
                    'is_read': row[6]
                })
            self.wfile.write(json.dumps(messages).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if parsed.path == '/api/messages':
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            subject = data.get('subject', '').strip()
            message = data.get('message', '').strip()

            if name and email and subject and message:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute(
                    'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
                    (name, email, subject, message)
                )
                conn.commit()
                msg_id = cursor.lastrowid
                conn.close()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'id': msg_id, 'db': 'sqlite'}).encode('utf-8'))
            else:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'All fields are required'}).encode('utf-8'))

        elif parsed.path == '/api/messages/toggle-read':
            msg_id = data.get('id')
            if msg_id:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('UPDATE messages SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END WHERE id = ?', (msg_id,))
                conn.commit()
                conn.close()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))

        elif parsed.path == '/api/messages/delete':
            msg_id = data.get('id')
            if msg_id:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('DELETE FROM messages WHERE id = ?', (msg_id,))
                conn.commit()
                conn.close()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))

if __name__ == '__main__':
    init_db()
    os.chdir(os.path.dirname(__file__))
    with socketserver.TCPServer(("0.0.0.0", PORT), SQLitePortfolioHandler) as httpd:
        print(f"==================================================")
        print(f" SQLite Portfolio Server running at http://0.0.0.0:{PORT}")
        print(f" Database file: {DB_FILE}")
        print(f"==================================================")
        httpd.serve_forever()
