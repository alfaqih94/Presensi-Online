// Data Pegawai - Edit file ini untuk mengubah data karyawan
const dataPegawai = [
  {
    userId: "1001",
    nama: "Abd",
    password: "1001",
    cabangId: "CAB001",
    jabatan: "Staff",
    status: "Aktif",
  },
  {
    userId: "1002",
    nama: "Faqih",
    password: "1002",
    cabangId: "CAB002",
    jabatan: "Staff",
    status: "Aktif",
  },
  {
    userId: "1003",
    nama: "Mila",
    password: "1003",
    cabangId: "CAB003",
    jabatan: "Staff",
    status: "Aktif",
  },
  {
    userId: "1004",
    nama: "Rosdiana",
    password: "1004",
    cabangId: "CAB004",
    jabatan: "Staff",
    status: "Aktif",
  },
  {
    userId: "admin",
    nama: "Administrator",
    password: "admin",
    cabangId: "ADM001",
    jabatan: "Admin",
    status: "Aktif",
    isAdmin: true,
  },
];

// Fungsi untuk mendapatkan data pegawai berdasarkan userId
function getPegawaiByUserId(userId) {
  return dataPegawai.find((pegawai) => pegawai.userId === userId);
}

// Fungsi untuk mendapatkan semua pegawai aktif (bukan admin)
function getAllPegawai() {
  return dataPegawai.filter(
    (pegawai) => !pegawai.isAdmin && pegawai.status === "Aktif"
  );
}

// Fungsi untuk mendapatkan pegawai berdasarkan cabang
function getPegawaiByCabang(cabangId) {
  return dataPegawai.filter(
    (pegawai) => pegawai.cabangId === cabangId && pegawai.status === "Aktif"
  );
}
