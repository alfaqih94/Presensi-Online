// Data Cabang - Edit file ini untuk mengubah data cabang
const dataCabang = [
  {
    cabangId: "CAB001",
    namaCabang: "Cabang 1",
    alamat: "Jl. Merdeka No. 123, Jakarta Pusat",
    telepon: "021-12345678",
    manager: "Budi Santoso",
    status: "Aktif",
  },
  {
    cabangId: "CAB002",
    namaCabang: "Cabang 2",
    alamat: "Jl. Sudirman No. 456, Jakarta Selatan",
    telepon: "021-87654321",
    manager: "Siti Nurhaliza",
    status: "Aktif",
  },
  {
    cabangId: "CAB003",
    namaCabang: "Cabang 3",
    alamat: "Jl. Thamrin No. 789, Jakarta Barat",
    telepon: "021-11223344",
    manager: "Ahmad Wijaya",
    status: "Aktif",
  },
  {
    cabangId: "CAB004",
    namaCabang: "Cabang 4",
    alamat: "Jl. Gatot Subroto No. 321, Jakarta Timur",
    telepon: "021-55667788",
    manager: "Dewi Sartika",
    status: "Aktif",
  },
  {
    cabangId: "ADM001",
    namaCabang: "Admin Panel",
    alamat: "Kantor Pusat",
    telepon: "021-99887766",
    manager: "System Administrator",
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
