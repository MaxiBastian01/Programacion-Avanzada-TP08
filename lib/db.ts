
import 'server-only'
import Database from 'better-sqlite3'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'experiment.db')

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
    event_type TEXT NOT NULL CHECK (
      event_type IN ('impression', 'conversion')
    ),
    session_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS unique_impression
  ON events(visitor_id, session_id, event_type);

  CREATE UNIQUE INDEX IF NOT EXISTS unique_conversion
  ON events(visitor_id, event_type)
  WHERE event_type = 'conversion';
`)

export default db
