import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data.db');

let db: Database;

export async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      emoji TEXT DEFAULT '💅',
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_working INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_name TEXT,
      service_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS day_offs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      reason TEXT
    );
  `);

  const [{ values }] = db.exec('SELECT COUNT(*) FROM services');
  if (values[0][0] === 0) {
    const services = [
      ['Маникюр классический', 60, 1500, 'Обработка кутикулы, придание формы ногтям', '✨'],
      ['Маникюр аппаратный', 70, 1800, 'Аппаратная обработка без замачивания', '💎'],
      ['Маникюр комби', 80, 2000, 'Комбинированная техника для идеального результата', '🌸'],
      ['Покрытие гель-лак', 40, 1000, 'Стойкое покрытие на 2-3 недели', '💅'],
      ['Педикюр', 90, 2500, 'Полный уход за ногтями на ногах', '🦶'],
      ['Наращивание ногтей', 120, 3500, 'Моделирование ногтей гелем или акрилом', '💫'],
      ['Дизайн ногтей', 30, 500, 'Художественное оформление ногтей', '🎨'],
    ];
    for (const [name, duration, price, description, emoji] of services) {
      db.run('INSERT INTO services (name, duration, price, description, emoji) VALUES (?, ?, ?, ?, ?)',
        [name, duration, price, description, emoji]);
    }
  }

  const [{ values: scheduleCount }] = db.exec('SELECT COUNT(*) FROM schedule');
  if (scheduleCount[0][0] === 0) {
    for (let i = 0; i < 7; i++) {
      db.run('INSERT INTO schedule (day_of_week, start_time, end_time, is_working) VALUES (?, ?, ?, ?)',
        [i, '09:00', '18:00', i < 5 ? 1 : 0]);
    }
  }

  saveDB();
}

export function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function query(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function run(sql: string, params: any[] = []): { lastId: number; changes: number } {
  db.run(sql, params);
  const lastId = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] as number;
  const changes = db.getRowsModified();
  saveDB();
  return { lastId, changes };
}

export function getOne(sql: string, params: any[] = []): any | null {
  const results = query(sql, params);
  return results[0] || null;
}

export default { query, run, getOne, initDB, saveDB };
