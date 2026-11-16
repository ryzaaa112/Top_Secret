const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new Database(path.join(dataDir, "top_secret.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS master_coa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_coa TEXT UNIQUE,
    nama_coa TEXT NOT NULL,
    kategori_akun TEXT,
    sub_kategori_akun TEXT,
    deskripsi TEXT,
    status INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrasi database lama: menambahkan kolom tanpa menghapus data.
const columns = db
  .prepare("PRAGMA table_info(master_coa)")
  .all()
  .map((column) => column.name);

if (!columns.includes("kategori_akun")) {
  db.exec("ALTER TABLE master_coa ADD COLUMN kategori_akun TEXT");
}

if (!columns.includes("sub_kategori_akun")) {
  db.exec("ALTER TABLE master_coa ADD COLUMN sub_kategori_akun TEXT");
}

console.log("SQLite berhasil terhubung!");

module.exports = db;