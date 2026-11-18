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

// Cek apakah tabel kegiatan_coa_items versi lama masih ada (yang pakai coa_id), jika ya perbarui skemanya
const itemCols = db
  .prepare("PRAGMA table_info(kegiatan_coa_items)")
  .all()
  .map((c) => c.name);

if (itemCols.length > 0 && !itemCols.includes("kode_coa")) {
  db.exec(`
    DROP TABLE IF EXISTS kegiatan_coa_items;
    DROP TABLE IF EXISTS kegiatan_coa;
  `);
}

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

  CREATE TABLE IF NOT EXISTS kegiatan_coa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bidang TEXT NOT NULL,
    nama_kegiatan TEXT NOT NULL,
    rutin_non_rutin TEXT NOT NULL,
    tipe_transaksi TEXT NOT NULL,
    total_keseluruhan REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS kegiatan_coa_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kegiatan_id INTEGER NOT NULL,
    kode_coa TEXT NOT NULL,
    qty REAL DEFAULT 1,
    harga_satuan REAL DEFAULT 0,
    frekuensi REAL DEFAULT 1,
    subtotal REAL DEFAULT 0,
    FOREIGN KEY (kegiatan_id) REFERENCES kegiatan_coa(id) ON DELETE CASCADE
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