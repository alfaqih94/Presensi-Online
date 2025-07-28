// Data Cabang - Edit file ini untuk mengubah data cabang
const dataCabang = [
  {
    cabangId: "C01",
    namaCabang: "Cabang Bangkal",
    status: "Aktif",
  },
  {
    cabangId: "C02",
    namaCabang: "Cabang POM",
    status: "Aktif",
  },
  {
    cabangId: "C03",
    namaCabang: "Cabang Gapura",
    status: "Aktif",
  },
  {
    cabangId: "C04",
    namaCabang: "Cabang Legung",
    status: "Aktif",
  },
  {
    cabangId: "ADM001",
    namaCabang: "Admin Panel",
    status: "Aktif",
  },
];

// Fungsi untuk mendapatkan data cabang berdasarkan cabangId
function getCabangById(cabangId) {
  return dataCabang.find((cabang) => cabang.cabangId === cabangId);
}

// Fungsi untuk mendapatkan semua cabang aktif (bukan admin)
function getAllCabang() {
  return dataCabang.filter(
    (cabang) => cabang.cabangId !== "ADM001" && cabang.status === "Aktif"
  );
}

// Fungsi untuk mendapatkan nama cabang berdasarkan cabangId
function getNamaCabang(cabangId) {
  const cabang = getCabangById(cabangId);
  return cabang ? cabang.namaCabang : "Cabang Tidak Ditemukan";
}
