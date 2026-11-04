const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

// GET: mengambil semua data COA
app.get("/api/coa", (req, res) => {
  try {
    const data = db
      .prepare("SELECT * FROM master_coa ORDER BY id DESC")
      .all();

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data COA" });
  }
});

// POST: menambahkan COA
app.post("/api/coa", (req, res) => {
  try {
    const { nama_coa, deskripsi } = req.body;

    if (!nama_coa || !nama_coa.trim()) {
      return res.status(400).json({
        message: "Nama COA wajib diisi",
      });
    }

    const result = db
      .prepare(`
        INSERT INTO master_coa (nama_coa, deskripsi)
        VALUES (?, ?)
      `)
      .run(nama_coa.trim(), deskripsi || "");

    const kode = `COA-${String(result.lastInsertRowid).padStart(4, "0")}`;

    db.prepare("UPDATE master_coa SET kode_coa = ? WHERE id = ?")
      .run(kode, result.lastInsertRowid);

    const data = db
      .prepare("SELECT * FROM master_coa WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambahkan COA" });
  }
});

// PUT: mengedit COA
app.put("/api/coa/:id", (req, res) => {
  try {
    const { nama_coa, deskripsi, status } = req.body;
    const id = Number(req.params.id);

    if (!nama_coa || !nama_coa.trim()) {
      return res.status(400).json({
        message: "Nama COA wajib diisi",
      });
    }

    const result = db
      .prepare(`
        UPDATE master_coa
        SET nama_coa = ?, deskripsi = ?, status = ?
        WHERE id = ?
      `)
      .run(nama_coa.trim(), deskripsi || "", status, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "COA tidak ditemukan" });
    }

    const data = db
      .prepare("SELECT * FROM master_coa WHERE id = ?")
      .get(id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengedit COA" });
  }
});

// DELETE: menghapus COA
app.delete("/api/coa/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM master_coa WHERE id = ?")
      .run(Number(req.params.id));

    if (result.changes === 0) {
      return res.status(404).json({ message: "COA tidak ditemukan" });
    }

    res.json({ message: "COA berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus COA" });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});