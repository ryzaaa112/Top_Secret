import { useEffect, useMemo, useState, useRef } from "react";
import {
  getCOA,
  addCOA,
  updateCOA,
  deleteCOA,
  importCOA,
} from "../api/api";

function COA() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [status, setStatus] = useState(1);
  const [error, setError] = useState("");
  
  // Ref untuk menghubungkan tombol kustom ke input file tersembunyi
  const fileInputRef = useRef(null);

  async function loadData() {
    try {
      setLoading(true);
      const result = await getCOA();
      setData(result);
      setError("");
    } catch {
      setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter(
      (item) =>
        item.kode_coa.toLowerCase().includes(keyword) ||
        item.nama_coa.toLowerCase().includes(keyword)
    );
  }, [data, search]);

  function openAddModal() {
    setEditId(null);
    setNama("");
    setDeskripsi("");
    setStatus(1);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditId(item.id);
    setNama(item.nama_coa);
    setDeskripsi(item.deskripsi || "");
    setStatus(item.status);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nama.trim()) {
      alert("Nama COA wajib diisi.");
      return;
    }

    try {
      const payload = {
        nama_coa: nama,
        deskripsi,
        status,
      };

      if (editId) {
        await updateCOA(editId, payload);
      } else {
        await addCOA(payload);
      }

      setModalOpen(false);
      await loadData();
    } catch {
      alert("Terjadi kesalahan saat menyimpan COA.");
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus ${item.kode_coa}?`
    );

    if (!confirmed) return;

    try {
      await deleteCOA(item.id);
      await loadData();
    } catch {
      alert("Gagal menghapus COA.");
    }
  }

  // Fungsi untuk menangani proses upload file Excel & refresh data otomatis
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ekstensi file
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert("Format file tidak didukung. Harap unggah file Excel (.xlsx/.xls) atau CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await importCOA(formData);
      alert("Berhasil mengimpor data Excel!");
      await loadData(); // Memuat ulang data agar tabel langsung ter-update
    } catch (err) {
      alert("Gagal mengimpor file Excel. Periksa kembali format file atau backend.");
    } finally {
      setLoading(false);
      e.target.value = ""; // Reset input file
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">T</div>
          <span>TOP_SECRET</span>
        </div>

        <div className="sidebar-label">MENU UTAMA</div>

        <div className="sidebar-menu">
          <div className="menu-item">
            <span className="menu-icon">▦</span>
            Dashboard
          </div>

          <div className="menu-item active">
            <span className="menu-icon">▤</span>
            Master COA
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="admin-avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>Admin</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Master Data</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Master COA</strong>
          </div>

          <div className="topbar-right">
            <span className="admin-label">Administrator</span>
            <div className="topbar-avatar">A</div>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <h1>Master COA</h1>
              <p>Kelola data kebutuhan untuk penyelenggaraan acara.</p>
            </div>

            {/* Tombol Aksi di Kanan (Import Excel & Tambah COA) */}
            <div style={{ display: "flex", gap: "10px" }}>
              {/* Input file tersembunyi */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />

              {/* Tombol Import Excel */}
              <button
                className="add-button"
                style={{ backgroundColor: "#107c41" }}
                onClick={() => fileInputRef.current.click()}
              >
                <span>📊</span> Import Excel
              </button>

              {/* Tombol Tambah COA */}
              <button className="add-button" onClick={openAddModal}>
                <span>+</span> Tambah COA
              </button>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">▤</div>
            <div>
              <span>Total COA</span>
              <h2>{data.length}</h2>
            </div>
          </div>

          <section className="table-card">
            <div className="table-heading">
              <div>
                <h2>Daftar COA</h2>
                <p>Daftar seluruh kebutuhan acara yang terdaftar.</p>
              </div>

              <div className="search-box">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Cari ID atau nama COA..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID COA</th>
                    <th>Nama COA</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                    <th className="action-column">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        {search
                          ? "Data COA tidak ditemukan."
                          : "Belum ada data COA. Klik Tambah COA untuk mulai mengisi."}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id}>
                        <td className="coa-code">{item.kode_coa}</td>
                        <td className="coa-name">{item.nama_coa}</td>
                        <td>{item.deskripsi || "-"}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              item.status === 1 ? "status-active" : "status-inactive"
                            }`}
                          >
                            {item.status === 1 ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => openEditModal(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(item)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Menampilkan {filteredData.length} dari {data.length} data
            </div>
          </section>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editId ? "Edit COA" : "Tambah COA"}</h2>
                <p>Lengkapi informasi kebutuhan acara.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Nama COA</label>
              <input
                type="text"
                placeholder="Masukkan nama COA"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                autoFocus
              />

              <label>Deskripsi</label>
              <textarea
                placeholder="Masukkan deskripsi COA (opsional)"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows="4"
              />

              {editId && (
                <>
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(Number(e.target.value))}
                  >
                    <option value={1}>Aktif</option>
                    <option value={0}>Tidak Aktif</option>
                  </select>
                </>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setModalOpen(false)}
                >
                  Batal
                </button>

                <button type="submit" className="save-button">
                  {editId ? "Simpan Perubahan" : "Simpan COA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default COA;