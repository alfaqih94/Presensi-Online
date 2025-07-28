function doPost(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(
      "Tidak ada data yang dikirim"
    ).setMimeType(ContentService.MimeType.TEXT);
  }

  // Ambil sheet aktif bernama "Data Absen"
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Kehadiran");

  // Jika sheet belum ada, buat baru dan tambahkan header
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Kehadiran");
    sheet.appendRow([
      "Nama",
      "Cabang",
      "Tanggal",
      "Masuk",
      "Pulang",
      "Status",
      "Keterangan",
    ]);
  }

  // Ambil data dari request POST
  var nama = e.parameter.Nama;
  var cabang = e.parameter["Cabang"];
  var tanggal = e.parameter["Tanggal"];
  var masuk = e.parameter["Masuk"];
  var pulang = e.parameter["Pulang"];
  var status = e.parameter["Status"];
  var keterangan = e.parameter["Keterangan"];

  // Tambahkan ke baris baru
  sheet.appendRow([nama, cabang, tanggal, masuk, pulang, status, keterangan]);

  return ContentService.createTextOutput(
    "Data absen berhasil disimpan."
  ).setMimeType(ContentService.MimeType.TEXT);
}
