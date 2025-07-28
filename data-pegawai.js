// Data Pegawai - Edit file ini untuk mengubah data karyawan
const dataPegawai = [
  {
    userId: "185",
    nama: "Safira Citra Mukholifah",
    password: "74",
    cabangId: "C01",
    status: "Aktif",
  },
  {
    userId: "153",
    nama: "⁠RA. Dewi Athar Octavia",
    password: "32",
    cabangId: "C01",
    status: "Aktif",
  },
  {
    userId: "147",
    nama: "Sifatul Qomariyah",
    password: "68",
    cabangId: "C01",
    status: "Aktif",
  },
  {
    userId: "209",
    nama: "⁠Puji Rahayu",
    password: "49",
    cabangId: "C02",
    status: "Aktif",
  },
  {
    userId: "248",
    nama: "⁠Della Sumartini",
    password: "93",
    cabangId: "C02",
    status: "Aktif",
  },
  {
    userId: "345",
    nama: "⁠Ika Romadhayanti",
    password: "27",
    cabangId: "C03",
    status: "Aktif",
  },
  {
    userId: "321",
    nama: "⁠Nor Faizah",
    password: "66",
    cabangId: "C03",
    status: "Aktif",
  },
  {
    userId: "396",
    nama: "Siddatun Nafila",
    password: "88",
    cabangId: "C03",
    status: "Aktif",
  },
  {
    userId: "492",
    nama: "⁠Qutwatul Umama",
    password: "27",
    cabangId: "C04",
    status: "Aktif",
  },
  {
    userId: "458",
    nama: "⁠Lutfiya",
    password: "28",
    cabangId: "C04",
    status: "Aktif",
  },
  {
    userId: "Admin",
    nama: "Administrator",
    password: "99",
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
