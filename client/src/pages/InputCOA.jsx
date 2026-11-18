import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getKegiatanCOA,
  addKegiatanCOA,
  deleteKegiatanCOA,
} from "../api/api";

function InputCOA() {
  const [bidang, setBidang] = useState("Diakonia");
  const [namaKegiatan, setNamaKegiatan] = useState("Ibadah usia indah");
  const [rutinNonRutin, setRutinNonRutin] = useState("Rutin");
  const [tipeTransaksi, setTipeTransaksi] = useState("Pengeluaran");

  const [items, setItems] = useState([
    { kode_coa: "Exp001", qty: 1, harga_satuan: 1000, frekuensi: 4 },
  ]);

  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRiwayat();
  }, []);

  async function loadRiwayat() {
    try {
      const data = await getKegiatanCOA();
      setRiwayatList(data);
    } catch {
      // Abaikan jika belum ada data
    }
  }

  function handleAddRow() {
    setItems([
      ...items,
      { kode_coa: "", qty: 1, harga_satuan: 0, frekuensi: 1 },
    ]);
  }

  function handleRemoveRow(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
  }

  const totalKeseluruhan = items.reduce((sum, item) => {
    const subtotal =
      (Number(item.qty) || 0) *
      (Number(item.harga_satuan) || 0) *
      (Number(item.frekuensi) || 0);
    return sum + subtotal;
  }, 0);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await addKegiatanCOA({
        bidang,
        nama_kegiatan: namaKegiatan,
        rutin_non_rutin: rutinNonRutin,
        tipe_transaksi: tipeTransaksi,
        items,
      });
      alert("Data Input Chart of Account berhasil disimpan!");
      await loadRiwayat();
    } catch (err) {
      alert(err.message || "Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus data kegiatan ini?")) return;
    try {
      await deleteKegiatanCOA(id);
      await loadRiwayat();
    } catch (err) {
      alert(err.message);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "6px",
  };

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

          <Link to="/" className="menu-item" style={{ textDecoration: "none" }}>
            <span className="menu-icon">▤</span>
            Master COA
          </Link>

          <Link
            to="/input-coa"
            className="menu-item active"
            style={{ textDecoration: "none" }}
          >
            <span className="menu-icon">✎</span>
            Input Chart of Account
          </Link>
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
            <strong>Input Chart of Account</strong>
          </div>

          <div className="topbar-right">
            <span className="admin-label">Administrator</span>
            <div className="topbar-avatar">A</div>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <h1>Input Chart of Account</h1>
              <p>
                Lengkapi informasi kegiatan dan rincian akun kebutuhan
                pengeluaran atau penerimaan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Card 1: Informasi Kegiatan */}
            <section className="table-card" style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
                    Informasi Kegiatan
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    Pilih klasifikasi bidang, jenis kegiatan, dan tipe transaksi
                  </p>
                </div>

                <span
                  style={{
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  Data Utama
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px 24px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Bidang <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value)}
                    placeholder="Contoh: Diakonia"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Nama Kegiatan <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={namaKegiatan}
                    onChange={(e) => setNamaKegiatan(e.target.value)}
                    placeholder="Contoh: Ibadah usia indah"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Rutin / non rutin <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={rutinNonRutin}
                    onChange={(e) => setRutinNonRutin(e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="Rutin">Rutin</option>
                    <option value="Non Rutin">Non Rutin</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Pengeluaran atau penerimaan{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={tipeTransaksi}
                    onChange={(e) => setTipeTransaksi(e.target.value)}
                    style={inputStyle}
                    required
                  >
                    <option value="Pengeluaran">Pengeluaran</option>
                    <option value="Penerimaan">Penerimaan</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Card 2: INPUT Chart of Account */}
            <section className="table-card" style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
                    INPUT Chart of Account
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    Masukkan ID COA manual (misal: Exp001), qty, harga satuan,
                    dan frekuensi.
                  </p>
                </div>

                <button
                  type="button"
                  className="add-button"
                  onClick={handleAddRow}
                >
                  <span>+</span> Tambah Baris
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>NO</th>
                      <th>ID COA (MANUAL CODE)</th>
                      <th style={{ width: "120px" }}>QTY</th>
                      <th style={{ width: "180px" }}>HARGA SATUAN (RP)</th>
                      <th style={{ width: "130px" }}>FREKUENSI</th>
                      <th style={{ width: "150px" }}>SUBTOTAL</th>
                      <th className="action-column" style={{ width: "90px" }}>
                        AKSI
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, idx) => {
                      const subtotal =
                        (Number(item.qty) || 0) *
                        (Number(item.harga_satuan) || 0) *
                        (Number(item.frekuensi) || 0);

                      return (
                        <tr key={idx}>
                          <td style={{ color: "#64748b", fontWeight: "500" }}>
                            {idx + 1}
                          </td>

                          <td>
                            <input
                              type="text"
                              value={item.kode_coa}
                              onChange={(e) =>
                                handleItemChange(idx, "kode_coa", e.target.value)
                              }
                              placeholder="Misal: Exp001"
                              style={{ ...inputStyle, padding: "8px 10px" }}
                              required
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={item.qty}
                              onChange={(e) =>
                                handleItemChange(idx, "qty", e.target.value)
                              }
                              style={{ ...inputStyle, padding: "8px 10px" }}
                              required
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={item.harga_satuan}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "harga_satuan",
                                  e.target.value
                                )
                              }
                              style={{ ...inputStyle, padding: "8px 10px" }}
                              required
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={item.frekuensi}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "frekuensi",
                                  e.target.value
                                )
                              }
                              style={{ ...inputStyle, padding: "8px 10px" }}
                              required
                            />
                          </td>

                          <td style={{ fontWeight: "600", color: "#1e293b" }}>
                            {formatRupiah(subtotal)}
                          </td>

                          <td className="action-buttons">
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => handleRemoveRow(idx)}
                              disabled={items.length === 1}
                              style={{
                                opacity: items.length === 1 ? 0.5 : 1,
                                cursor:
                                  items.length === 1
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total Keseluruhan & Tombol Save */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid #f1f5f9",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "48px",
                    paddingRight: "90px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#64748b",
                      letterSpacing: "0.05em",
                    }}
                  >
                    TOTAL KESELURUHAN
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#2563eb",
                    }}
                  >
                    {formatRupiah(totalKeseluruhan)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="add-button"
                  disabled={loading}
                  style={{ padding: "10px 22px" }}
                >
                  <span>💾</span> {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </section>
          </form>

          {/* Riwayat Data Tersimpan */}
          {riwayatList.length > 0 && (
            <section className="table-card">
              <div className="table-heading">
                <div>
                  <h2>Data Kegiatan Tersimpan</h2>
                  <p>Daftar rincian COA kegiatan yang telah disimpan.</p>
                </div>
              </div>

              {riwayatList.map((keg) => (
                <div
                  key={keg.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <span
                        className="status-badge status-active"
                        style={{ marginRight: "8px" }}
                      >
                        {keg.bidang}
                      </span>
                      <strong style={{ fontSize: "15px", marginRight: "8px" }}>
                        {keg.nama_kegiatan}
                      </strong>
                      <small style={{ color: "#64748b" }}>
                        ({keg.rutin_non_rutin} • {keg.tipe_transaksi})
                      </small>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <strong style={{ color: "#2563eb" }}>
                        {formatRupiah(keg.total_keseluruhan)}
                      </strong>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(keg.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>NO</th>
                          <th>ID COA</th>
                          <th>QTY</th>
                          <th>HARGA SATUAN</th>
                          <th>FREKUENSI</th>
                          <th>SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keg.items.map((item, i) => (
                          <tr key={item.id}>
                            <td>{i + 1}</td>
                            <td className="coa-code">{item.kode_coa}</td>
                            <td>{item.qty}</td>
                            <td>{formatRupiah(item.harga_satuan)}</td>
                            <td>{item.frekuensi}</td>
                            <td style={{ fontWeight: "600" }}>
                              {formatRupiah(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default InputCOA;