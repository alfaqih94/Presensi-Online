// Data Pegawai - Edit file ini untuk mengubah data karyawan
const dataPegawai = [
  {
    userId: "2",
    nama: "Abd",
    password: "2",
    cabangId: "CAB001",
    jabatan: "Staff",
    status: "Aktif",
  },
  {
    userId: "3",
    nama: "Faqih",
    password: "3",
    cabangId: "CAB002",
    jabatan: "Staff",
    status: "Aktif",
  },
  {
    userId: "1",
    nama: "Administrator",
    password: "1",
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
