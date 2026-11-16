const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
});

function cleanText(value) {
  return value === undefined || value === null
    ? ""
    : String(value).trim();
}

function validateCOA(body) {
  const kode_coa = cleanText(body.kode_coa);
  const nama_coa = cleanText(body.nama_coa);
  const kategori_akun = cleanText(body.kategori_akun);
  const sub_kategori_akun = cleanText(body.sub_kategori_akun);

  if (
    !kode_coa ||
    !nama_coa ||
    !kategori_akun ||
    !sub_kategori_akun
  ) {
    return {
      error: "Semua kolom COA wajib diisi.",
    };
  }

  return {
    value: {
      kode_coa,
      nama_coa,
      kategori_akun,
      sub_kategori_akun,
      deskripsi: cleanText(body.deskripsi),
      status: body.status === undefined ? 1 : Number(body.status),
    },
  };
}

// GET: mengambil seluruh data COA
app.get("/api/coa", (req, res) => {
  try {
    const data = db
      .prepare("SELECT * FROM master_coa ORDER BY id DESC")
      .all();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data COA",
    });
  }
});

// POST: menambahkan COA
app.post("/api/coa", (req, res) => {
  try {
    const validated = validateCOA(req.body);

    if (validated.error) {
      return res.status(400).json({
        message: validated.error,
      });
    }

    const {
      kode_coa,
      nama_coa,
      kategori_akun,
      sub_kategori_akun,
      deskripsi,
      status,
    } = validated.value;

    if (![0, 1].includes(status)) {
      return res.status(400).json({
        message: "Status tidak valid.",
      });
    }

    const result = db.prepare(`
      INSERT INTO master_coa (
        kode_coa,
        nama_coa,
        kategori_akun,
        sub_kategori_akun,
        deskripsi,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      kode_coa,
      nama_coa,
      kategori_akun,
      sub_kategori_akun,
      deskripsi,
      status
    );

    const data = db
      .prepare("SELECT * FROM master_coa WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(data);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "Kode COA sudah digunakan. Masukkan kode lain.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Gagal menambahkan COA",
    });
  }
});

// POST: Import COA dari Excel / CSV
app.post("/api/coa/import", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Tidak ada file yang diunggah",
      });
    }

    const workbook = xlsx.read(req.file.buffer, {
      type: "buffer",
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({
        message: "File Excel kosong atau format tidak sesuai",
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO master_coa (
        kode_coa,
        nama_coa,
        kategori_akun,
        sub_kategori_akun,
        deskripsi,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const imported = db.transaction((dataRows) => {
      let count = 0;

      for (const originalRow of dataRows) {
        const row = {};

        Object.keys(originalRow).forEach((key) => {
          row[key.trim().toLowerCase()] = originalRow[key];
        });

        const kode_coa = cleanText(
          row["kode coa"] ?? row.kode_coa
        );

        const nama_coa = cleanText(
          row["nama coa"] ??
          row["nama akun"] ??
          row.nama_coa ??
          row.nama
        );

        const kategori_akun = cleanText(
          row["kategori akun"] ?? row.kategori_akun
        );

        const sub_kategori_akun = cleanText(
          row["sub kategori akun"] ??
          row["subkategori akun"] ??
          row.sub_kategori_akun
        );

        const deskripsi = cleanText(
          row["deskripsi"] ??
          row["keterangan / dasar pemetaan"] ??
          row.deskripsi
        );

        const status = row.status === undefined
          ? 1
          : Number(row.status);

        if (
          !kode_coa ||
          !nama_coa ||
          !kategori_akun ||
          !sub_kategori_akun
        ) {
          throw new Error(
            "Setiap baris wajib memiliki Kode COA, Nama COA, Kategori Akun, dan Sub Kategori Akun."
          );
        }

        if (![0, 1].includes(status)) {
          throw new Error(
            `Status COA ${kode_coa} harus 0 atau 1.`
          );
        }

        insertStmt.run(
          kode_coa,
          nama_coa,
          kategori_akun,
          sub_kategori_akun,
          deskripsi,
          status
        );

        count++;
      }

      return count;
    });

    const count = imported(rows);

    res.json({
      message: `${count} data COA berhasil diimpor.`,
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "Import dibatalkan karena ada Kode COA yang sudah digunakan.",
      });
    }

    res.status(400).json({
      message: error.message || "Gagal memproses file Excel",
    });
  }
});

// PUT: mengedit COA
app.put("/api/coa/:id", (req, res) => {
  try {
    const validated = validateCOA(req.body);

    if (validated.error) {
      return res.status(400).json({
        message: validated.error,
      });
    }

    const {
      kode_coa,
      nama_coa,
      kategori_akun,
      sub_kategori_akun,
      deskripsi,
      status,
    } = validated.value;

    if (![0, 1].includes(status)) {
      return res.status(400).json({
        message: "Status tidak valid.",
      });
    }

    const id = Number(req.params.id);

    const result = db.prepare(`
      UPDATE master_coa
      SET
        kode_coa = ?,
        nama_coa = ?,
        kategori_akun = ?,
        sub_kategori_akun = ?,
        deskripsi = ?,
        status = ?
      WHERE id = ?
    `).run(
      kode_coa,
      nama_coa,
      kategori_akun,
      sub_kategori_akun,
      deskripsi,
      status,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        message: "COA tidak ditemukan",
      });
    }

    const data = db
      .prepare("SELECT * FROM master_coa WHERE id = ?")
      .get(id);

    res.json(data);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "Kode COA sudah digunakan. Masukkan kode lain.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Gagal mengedit COA",
    });
  }
});

// DELETE: menghapus COA
app.delete("/api/coa/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM master_coa WHERE id = ?")
      .run(Number(req.params.id));

    if (result.changes === 0) {
      return res.status(404).json({
        message: "COA tidak ditemukan",
      });
    }

    res.json({
      message: "COA berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus COA",
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});