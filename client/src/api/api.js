const API_URL = "http://localhost:3001/api";

export async function getCOA() {
  const response = await fetch(`${API_URL}/coa`);
  if (!response.ok) throw new Error("Gagal mengambil data COA");
  return response.json();
}

export async function addCOA(data) {
  const response = await fetch(`${API_URL}/coa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Gagal menambahkan COA");
  return response.json();
}

export async function updateCOA(id, data) {
  const response = await fetch(`${API_URL}/coa/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Gagal mengedit COA");
  return response.json();
}

export async function deleteCOA(id) {
  const response = await fetch(`${API_URL}/coa/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Gagal menghapus COA");
  return response.json();
}

// Fungsi API untuk Import Excel
export async function importCOA(formData) {
  const response = await fetch(`${API_URL}/coa/import`, {
    method: "POST",
    body: formData, // Tanpa Content-Type header agar browser otomatis handle multipart/form-data
  });

  if (!response.ok) throw new Error("Gagal mengimpor file Excel");
  return response.json();
}