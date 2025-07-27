// Aplikasi Presensi Karyawan - Main JavaScript File

let currentUser = null;
let currentPermissionType = "";

// Google Sheets configuration
const SHEET_ID = "1mkNKEqZ2dqVqU_kk5I2hyecCEf-rlNevEjw4QDvgmuY";
const SHEET_NAME = "Kehadiran";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzYPal7F5_VZ1ThN9uzgoFIzDnxbY0bpZMrazt0tQdnXGqvkXbLYJwV6Vw3D99tBBxI/exec";

// Initialize application when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  // Populate employee dropdown in admin panel
  populateEmployeeDropdown();

  // Set up login form
  document
    .getElementById("loginFormSubmit")
    .addEventListener("submit", handleLogin);

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);
}

// Populate employee dropdown for admin reports
function populateEmployeeDropdown() {
  const dropdown = document.getElementById("employeeReportFilter");
  if (dropdown) {
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Pilih Pegawai</option>';

    // Add all active employees
    const allPegawai = getAllPegawai();
    allPegawai.forEach((pegawai) => {
      const option = document.createElement("option");
      option.value = pegawai.nama;
      option.textContent = `${pegawai.nama} - ${getNamaCabang(
        pegawai.cabangId
      )}`;
      dropdown.appendChild(option);
    });
  }
}

// Login functionality
function handleLogin(e) {
  e.preventDefault();
  const userId = document.getElementById("userId").value;
  const password = document.getElementById("password").value;

  const pegawai = getPegawaiByUserId(userId);

  if (pegawai && pegawai.password === password && pegawai.status === "Aktif") {
    currentUser = {
      id: userId,
      nama: pegawai.nama,
      cabangId: pegawai.cabangId,
      cabang: getNamaCabang(pegawai.cabangId),
      jabatan: pegawai.jabatan,
      isAdmin: pegawai.isAdmin || false,
    };
    showDashboard();
  } else {
    document.getElementById("loginError").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("loginError").classList.add("hidden");
    }, 3000);
  }
}

function showDashboard() {
  document.getElementById("loginForm").classList.add("hidden");

  if (currentUser.isAdmin) {
    // Show admin dashboard
    document.getElementById("adminDashboard").classList.remove("hidden");
    updateClock();

    // Set default month filter to current month
    const now = new Date();
    const currentMonth =
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    document.getElementById("monthFilter").value = currentMonth;
    document.getElementById("employeeMonthFilter").value = currentMonth;

    // Load today's attendance by default
    loadTodayAttendance();

    // Auto-refresh today's data every 30 seconds
    setInterval(() => {
      if (currentUser && currentUser.isAdmin) {
        loadTodayAttendance();
      }
    }, 30000);
  } else {
    // Show employee dashboard
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("userName").textContent = currentUser.nama;
    document.getElementById("userBranch").textContent = currentUser.cabang;
    updateClock();

    // Show sync modal and load data
    showSyncModal();
    loadWeeklyAttendance();

    // Auto-refresh attendance data every 30 seconds
    setInterval(() => {
      if (currentUser && !currentUser.isAdmin) {
        loadWeeklyAttendance();
      }
    }, 30000);
  }
}

function logout() {
  currentUser = null;
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("adminDashboard").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("userId").value = "";
  document.getElementById("password").value = "";
}

// Clock functionality
function updateClock() {
  const now = new Date();
  const timeOptions = {
    timeZone: "Asia/Jakarta",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const dateOptions = {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeElement = document.getElementById("currentTime");
  const dateElement = document.getElementById("currentDate");

  if (timeElement) {
    timeElement.textContent =
      now.toLocaleTimeString("id-ID", timeOptions) + " WIB";
  }
  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString("id-ID", dateOptions);
  }
}

// Format functions for consistent date and time display
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Attendance functions
function clockIn() {
  showLoadingModal();
  const now = new Date();
  const timeString = formatTime(now);
  const dateString = formatDate(now);

  sendToGoogleSheets({
    Nama: currentUser.nama,
    Cabang: currentUser.cabang,
    Tanggal: dateString,
    Masuk: timeString,
  });
}

function clockOut() {
  showLoadingModal();
  const now = new Date();
  const timeString = formatTime(now);
  const dateString = formatDate(now);

  sendToGoogleSheets({
    Nama: currentUser.nama,
    Cabang: currentUser.cabang,
    Tanggal: dateString,
    Pulang: timeString,
  });
}

function showPermissionForm(type) {
  currentPermissionType = type;
  document.getElementById("permissionTitle").textContent = `Form ${type}`;
  document.getElementById("permissionModal").classList.remove("hidden");
  document.getElementById("permissionNote").focus();
}

function closePermissionModal() {
  document.getElementById("permissionModal").classList.add("hidden");
  document.getElementById("permissionNote").value = "";
}

function submitPermission() {
  const note = document.getElementById("permissionNote").value.trim();
  if (!note) {
    alert("Harap isi keterangan terlebih dahulu!");
    return;
  }

  closePermissionModal();
  showLoadingModal();

  const now = new Date();
  const dateString = formatDate(now);

  sendToGoogleSheets({
    Nama: currentUser.nama,
    Cabang: currentUser.cabang,
    Tanggal: dateString,
    Status: currentPermissionType,
    Keterangan: note,
  });
}

// Modal functions
function showSyncModal() {
  document.getElementById("syncModal").classList.remove("hidden");
}

function hideSyncModal() {
  document.getElementById("syncModal").classList.add("hidden");
}

function showLoadingModal() {
  document.getElementById("loadingModal").classList.remove("hidden");
}

function hideLoadingModal() {
  document.getElementById("loadingModal").classList.add("hidden");
}

// Google Sheets integration
async function sendToGoogleSheets(data) {
  try {
    console.log("Data yang akan dikirim:", data);

    // Create form data for POST request
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    console.log("Response:", result);

    hideLoadingModal();

    if (result.includes("berhasil")) {
      showSuccessMessage();
      // Update tabel rekap
      setTimeout(() => {
        loadWeeklyAttendance();
      }, 500);
    } else {
      showErrorMessage("Gagal mengirim data: " + result);
    }
  } catch (error) {
    console.error("Error:", error);
    hideLoadingModal();
    showErrorMessage(
      "Terjadi kesalahan saat mengirim data. Periksa koneksi internet Anda."
    );
  }
}

function showSuccessMessage(message = "Data berhasil dikirim!") {
  const successMsg = document.getElementById("successMessage");
  successMsg.textContent = message;
  successMsg.classList.remove("hidden");
  setTimeout(() => {
    successMsg.classList.add("hidden");
  }, 3000);
}

function showErrorMessage(errorText) {
  // Create error message element if it doesn't exist
  let errorMessage = document.getElementById("errorMessage");
  if (!errorMessage) {
    errorMessage = document.createElement("div");
    errorMessage.id = "errorMessage";
    errorMessage.className =
      "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    document.body.appendChild(errorMessage);
  }

  errorMessage.textContent = errorText;
  errorMessage.classList.remove("hidden");
  setTimeout(() => {
    errorMessage.classList.add("hidden");
  }, 5000);
}

// Weekly attendance summary - Real-time from Google Sheets
async function loadWeeklyAttendance() {
  const tableBody = document.getElementById("attendanceTable");

  try {
    // Show loading state
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center py-4 text-gray-500">Memuat data...</td></tr>';

    // Fetch data from Google Sheets URL directly
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    // Parse CSV data
    const rows = csvText.split("\n").map((row) => {
      // Simple CSV parsing - handle quoted values
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });

    if (rows.length > 1) {
      // Clear loading state
      tableBody.innerHTML = "";

      // Filter data for current user and last 7 days
      const userAttendance = filterUserAttendanceLastWeek(rows);

      if (userAttendance.length > 0) {
        userAttendance.forEach((record) => {
          const row = document.createElement("tr");
          row.className = "border-b border-gray-200 hover:bg-gray-50";
          row.innerHTML = `
                        <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">${
                          record.tanggal
                        }</td>
                        <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">${
                          record.masuk || "-"
                        }</td>
                        <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">${
                          record.pulang || "-"
                        }</td>
                        <td class="px-2 sm:px-4 py-2 sm:py-3">
                            <span class="px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              record.status
                            )}">
                                ${record.status}
                            </span>
                        </td>
                        <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">${
                          record.keterangan || "-"
                        }</td>
                    `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="5" class="text-center py-4 text-gray-500">Belum ada data kehadiran minggu ini</td></tr>';
      }
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="5" class="text-center py-4 text-gray-500">Belum ada data kehadiran</td></tr>';
    }

    // Hide sync modal after loading
    hideSyncModal();
  } catch (error) {
    console.error("Error loading attendance data:", error);
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center py-4 text-red-500">Error memuat data. Periksa koneksi internet.</td></tr>';

    // Hide sync modal even on error
    hideSyncModal();
  }
}

// Filter attendance data for current user and last 7 days
function filterUserAttendanceLastWeek(data) {
  if (!data || data.length <= 1) return []; // Skip header row

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Skip header row (index 0) and filter data
  const filteredData = data.slice(1).filter((row) => {
    if (!row || row.length < 7) return false;

    const [nama, cabang, tanggal, masuk, pulang, status, keterangan] = row;

    // Check if this record belongs to current user
    if (nama !== currentUser.nama) return false;

    // Parse date and check if it's within last 7 days
    try {
      const recordDate = parseIndonesianDate(tanggal);
      return recordDate >= weekAgo && recordDate <= today;
    } catch (e) {
      console.error("Error parsing date:", tanggal, e);
      return false;
    }
  });

  // Group by date and merge clock in/out times
  const groupedByDate = {};

  filteredData.forEach((row) => {
    const [nama, cabang, tanggal, masuk, pulang, status, keterangan] = row;

    if (!groupedByDate[tanggal]) {
      groupedByDate[tanggal] = {
        tanggal: tanggal,
        masuk: "",
        pulang: "",
        status: status,
        keterangan: keterangan,
      };
    }

    // Update masuk time if provided
    if (masuk && masuk.trim() !== "") {
      groupedByDate[tanggal].masuk = masuk;
    }

    // Update pulang time if provided
    if (pulang && pulang.trim() !== "") {
      groupedByDate[tanggal].pulang = pulang;
    }

    // Update status and keterangan (prioritize non-empty values)
    if (status && status.trim() !== "") {
      groupedByDate[tanggal].status = status;
    }
    if (keterangan && keterangan.trim() !== "") {
      groupedByDate[tanggal].keterangan = keterangan;
    }

    // Auto-set status to "Hadir" if both masuk and pulang times exist
    if (
      groupedByDate[tanggal].masuk &&
      groupedByDate[tanggal].pulang &&
      groupedByDate[tanggal].masuk.trim() !== "" &&
      groupedByDate[tanggal].pulang.trim() !== ""
    ) {
      groupedByDate[tanggal].status = "Hadir";
    }
  });

  // Convert to array and sort by date
  return Object.values(groupedByDate).sort((a, b) => {
    try {
      const dateA = parseIndonesianDate(a.tanggal);
      const dateB = parseIndonesianDate(b.tanggal);
      return dateB - dateA; // Sort descending (newest first)
    } catch (e) {
      return 0;
    }
  });
}

// Parse date format (DD/MM/YYYY)
function parseIndonesianDate(dateString) {
  if (!dateString) return new Date();

  const parts = dateString.split("/");
  if (parts.length !== 3) return new Date();

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

function getStatusColor(status) {
  switch (status) {
    case "Hadir":
      return "bg-green-100 text-green-800";
    case "Izin":
      return "bg-yellow-100 text-yellow-800";
    case "Sakit":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Admin Functions
function showAdminTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".admin-tab-content").forEach((content) => {
    content.classList.add("hidden");
  });

  // Remove active class from all tabs
  document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.classList.remove("active", "border-blue-500", "text-blue-600");
    btn.classList.add("border-transparent", "text-gray-500");
  });

  // Show selected tab content
  document.getElementById(tabName + "Content").classList.remove("hidden");

  // Add active class to selected tab
  const activeTab = document.getElementById(tabName + "Tab");
  activeTab.classList.add("active", "border-blue-500", "text-blue-600");
  activeTab.classList.remove("border-transparent", "text-gray-500");

  // Auto-load data when switching to monthly tab
  if (tabName === "monthly") {
    loadMonthlyReport();
  }
}

async function loadTodayAttendance() {
  const tableBody = document.getElementById("todayAttendanceTable");

  try {
    tableBody.innerHTML =
      '<tr><td colspan="7" class="text-center py-4 text-gray-500">Memuat data...</td></tr>';

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const rows = csvText.split("\n").map((row) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });

    if (rows.length > 1) {
      const today = formatDate(new Date());
      const todayData = filterTodayAttendance(rows, today);

      tableBody.innerHTML = "";

      if (todayData.length > 0) {
        todayData.forEach((record) => {
          const row = document.createElement("tr");
          row.className = "border-b border-gray-200 hover:bg-gray-50";
          row.innerHTML = `
                        <td class="px-4 py-3 text-sm">${record.nama}</td>
                        <td class="px-4 py-3 text-sm">${record.cabang}</td>
                        <td class="px-4 py-3 text-sm">${record.tanggal}</td>
                        <td class="px-4 py-3 text-sm">${
                          record.masuk || "-"
                        }</td>
                        <td class="px-4 py-3 text-sm">${
                          record.pulang || "-"
                        }</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              record.status
                            )}">
                                ${record.status || "-"}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm">${
                          record.keterangan || "-"
                        }</td>
                    `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="7" class="text-center py-4 text-gray-500">Belum ada data kehadiran hari ini</td></tr>';
      }
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="7" class="text-center py-4 text-gray-500">Tidak ada data tersedia</td></tr>';
    }
  } catch (error) {
    console.error("Error loading today attendance:", error);
    tableBody.innerHTML =
      '<tr><td colspan="7" class="text-center py-4 text-red-500">Error memuat data</td></tr>';
  }
}

function filterTodayAttendance(data, today) {
  if (!data || data.length <= 1) return [];

  const filteredData = data.slice(1).filter((row) => {
    if (!row || row.length < 7) return false;
    const [nama, cabang, tanggal] = row;
    return tanggal === today;
  });

  const groupedByEmployee = {};

  filteredData.forEach((row) => {
    const [nama, cabang, tanggal, masuk, pulang, status, keterangan] = row;
    const key = `${nama}-${cabang}`;

    if (!groupedByEmployee[key]) {
      groupedByEmployee[key] = {
        nama: nama,
        cabang: cabang,
        tanggal: tanggal,
        masuk: "",
        pulang: "",
        status: status,
        keterangan: keterangan,
      };
    }

    if (masuk && masuk.trim() !== "") {
      groupedByEmployee[key].masuk = masuk;
    }
    if (pulang && pulang.trim() !== "") {
      groupedByEmployee[key].pulang = pulang;
    }
    if (status && status.trim() !== "") {
      groupedByEmployee[key].status = status;
    }
    if (keterangan && keterangan.trim() !== "") {
      groupedByEmployee[key].keterangan = keterangan;
    }

    // Auto-set status to "Hadir" if both times exist
    if (
      groupedByEmployee[key].masuk &&
      groupedByEmployee[key].pulang &&
      groupedByEmployee[key].masuk.trim() !== "" &&
      groupedByEmployee[key].pulang.trim() !== ""
    ) {
      groupedByEmployee[key].status = "Hadir";
    }
  });

  return Object.values(groupedByEmployee);
}

async function loadMonthlyReport() {
  const cardsContainer = document.getElementById("monthlyReportCards");
  const monthFilter = document.getElementById("monthFilter").value;

  // If no month selected, use current month
  if (!monthFilter) {
    const now = new Date();
    const currentMonth =
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    document.getElementById("monthFilter").value = currentMonth;
  }

  const selectedMonth = document.getElementById("monthFilter").value;

  try {
    cardsContainer.innerHTML =
      '<div class="col-span-full text-center py-8 text-gray-500">Memuat data...</div>';

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const rows = csvText.split("\n").map((row) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });

    if (rows.length > 1) {
      // Show all employees and all branches for the selected month
      const summaryData = generateMonthlySummary(rows, "", "", selectedMonth);

      cardsContainer.innerHTML = "";

      if (summaryData.length > 0) {
        summaryData.forEach((employee) => {
          const card = document.createElement("div");
          card.className =
            "bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300";
          card.innerHTML = `
                        <div class="flex items-center mb-4">
                            <div class="bg-blue-100 rounded-full p-3 mr-4">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-gray-800">${employee.nama}</h3>
                                <p class="text-sm text-gray-600">${employee.cabang}</p>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <span class="text-sm font-medium text-gray-700">Hadir</span>
                                </div>
                                <span class="text-lg font-bold text-green-600">${employee.hadir}</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                    <span class="text-sm font-medium text-gray-700">Izin</span>
                                </div>
                                <span class="text-lg font-bold text-yellow-600">${employee.izin}</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <div class="flex items-center">
                                    <div class="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                    <span class="text-sm font-medium text-gray-700">Sakit</span>
                                </div>
                                <span class="text-lg font-bold text-red-600">${employee.sakit}</span>
                            </div>
                        </div>
                        
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <div class="flex justify-between text-sm text-gray-600">
                                <span>Total Hari</span>
                                <span class="font-semibold">${employee.total}</span>
                            </div>
                        </div>
                    `;
          cardsContainer.appendChild(card);
        });
      } else {
        cardsContainer.innerHTML =
          '<div class="col-span-full text-center py-8 text-gray-500">Tidak ada data untuk bulan yang dipilih</div>';
      }
    } else {
      cardsContainer.innerHTML =
        '<div class="col-span-full text-center py-8 text-gray-500">Tidak ada data tersedia</div>';
    }
  } catch (error) {
    console.error("Error loading monthly report:", error);
    cardsContainer.innerHTML =
      '<div class="col-span-full text-center py-8 text-red-500">Error memuat data</div>';
  }
}

function generateMonthlySummary(
  data,
  employeeFilter,
  branchFilter,
  monthFilter
) {
  if (!data || data.length <= 1) return [];

  const [year, month] = monthFilter.split("-");

  // Get all employees from data files
  const allPegawai = getAllPegawai();

  // Filter employees based on filters
  let employeesToShow = allPegawai;
  if (employeeFilter) {
    employeesToShow = allPegawai.filter((emp) => emp.nama === employeeFilter);
  }
  if (branchFilter) {
    employeesToShow = employeesToShow.filter(
      (emp) => getNamaCabang(emp.cabangId) === branchFilter
    );
  }

  // Filter data by month
  const filteredData = data.slice(1).filter((row) => {
    if (!row || row.length < 7) return false;

    const [nama, cabang, tanggal] = row;

    // Filter by month
    try {
      const recordDate = parseIndonesianDate(tanggal);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth() + 1;

      return recordYear == year && recordMonth == month;
    } catch (e) {
      return false;
    }
  });

  // Group by employee and date, then merge records
  const groupedByDateEmployee = {};

  filteredData.forEach((row) => {
    const [nama, cabang, tanggal, masuk, pulang, status, keterangan] = row;
    const key = `${nama}-${tanggal}`;

    if (!groupedByDateEmployee[key]) {
      groupedByDateEmployee[key] = {
        nama: nama,
        cabang: cabang,
        tanggal: tanggal,
        masuk: "",
        pulang: "",
        status: status || "",
        keterangan: keterangan || "",
      };
    }

    if (masuk && masuk.trim() !== "") {
      groupedByDateEmployee[key].masuk = masuk;
    }
    if (pulang && pulang.trim() !== "") {
      groupedByDateEmployee[key].pulang = pulang;
    }
    if (status && status.trim() !== "") {
      groupedByDateEmployee[key].status = status;
    }
    if (keterangan && keterangan.trim() !== "") {
      groupedByDateEmployee[key].keterangan = keterangan;
    }

    // Auto-set status to "Hadir" if both times exist
    if (
      groupedByDateEmployee[key].masuk &&
      groupedByDateEmployee[key].pulang &&
      groupedByDateEmployee[key].masuk.trim() !== "" &&
      groupedByDateEmployee[key].pulang.trim() !== ""
    ) {
      groupedByDateEmployee[key].status = "Hadir";
    }
  });

  // Generate summary for each employee
  const summaryData = employeesToShow.map((pegawai) => {
    const employeeName = pegawai.nama;
    const employeeBranch = getNamaCabang(pegawai.cabangId);

    // Get all records for this employee
    const employeeRecords = Object.values(groupedByDateEmployee).filter(
      (record) => record.nama === employeeName
    );

    // Count attendance types
    let hadir = 0;
    let izin = 0;
    let sakit = 0;

    employeeRecords.forEach((record) => {
      const status = record.status || "";
      if (status === "Hadir") {
        hadir++;
      } else if (status === "Izin") {
        izin++;
      } else if (status === "Sakit") {
        sakit++;
      }
    });

    const total = hadir + izin + sakit;

    return {
      nama: employeeName,
      cabang: employeeBranch,
      hadir: hadir,
      izin: izin,
      sakit: sakit,
      total: total,
    };
  });

  return summaryData;
}

async function loadEmployeeReport() {
  const employeeName = document.getElementById("employeeReportFilter").value;
  const monthFilter = document.getElementById("employeeMonthFilter").value;
  const tableBody = document.getElementById("employeeReportTable");
  const titleElement = document.getElementById("employeeReportTitle");
  const summaryDiv = document.getElementById("employeeSummary");

  if (!employeeName) {
    alert("Harap pilih pegawai terlebih dahulu!");
    return;
  }

  if (!monthFilter) {
    alert("Harap pilih bulan terlebih dahulu!");
    return;
  }

  try {
    tableBody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4 text-gray-500">Memuat data...</td></tr>';
    titleElement.textContent = `Rekap Kehadiran ${employeeName}`;

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    const rows = csvText.split("\n").map((row) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });

    if (rows.length > 1) {
      const employeeData = generateEmployeeMonthlyReport(
        rows,
        employeeName,
        monthFilter
      );

      tableBody.innerHTML = "";

      if (employeeData.length > 0) {
        let hadirCount = 0;
        let izinCount = 0;
        let sakitCount = 0;

        employeeData.forEach((record) => {
          const row = document.createElement("tr");
          row.className = "border-b border-gray-200 hover:bg-gray-50";

          // Count status
          if (record.status === "Hadir") hadirCount++;
          else if (record.status === "Izin") izinCount++;
          else if (record.status === "Sakit") sakitCount++;

          row.innerHTML = `
                        <td class="px-4 py-3 text-sm">${record.tanggal}</td>
                        <td class="px-4 py-3 text-sm">${record.hari}</td>
                        <td class="px-4 py-3 text-sm">${
                          record.masuk || "-"
                        }</td>
                        <td class="px-4 py-3 text-sm">${
                          record.pulang || "-"
                        }</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              record.status
                            )}">
                                ${record.status}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm">${
                          record.keterangan || "-"
                        }</td>
                    `;
          tableBody.appendChild(row);
        });

        // Update summary
        document.getElementById("summaryHadir").textContent = hadirCount;
        document.getElementById("summaryIzin").textContent = izinCount;
        document.getElementById("summarySakit").textContent = sakitCount;
        document.getElementById("summaryTotal").textContent =
          hadirCount + izinCount + sakitCount;
        summaryDiv.classList.remove("hidden");
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="6" class="text-center py-4 text-gray-500">Tidak ada data untuk bulan yang dipilih</td></tr>';
        summaryDiv.classList.add("hidden");
      }
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="text-center py-4 text-gray-500">Tidak ada data tersedia</td></tr>';
      summaryDiv.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error loading employee report:", error);
    tableBody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4 text-red-500">Error memuat data</td></tr>';
    summaryDiv.classList.add("hidden");
  }
}

function generateEmployeeMonthlyReport(data, employeeName, monthFilter) {
  if (!data || data.length <= 1) return [];

  const [year, month] = monthFilter.split("-");

  // Filter data by employee and month
  const filteredData = data.slice(1).filter((row) => {
    if (!row || row.length < 7) return false;

    const [nama, cabang, tanggal] = row;

    // Check employee name
    if (nama !== employeeName) return false;

    // Check month
    try {
      const recordDate = parseIndonesianDate(tanggal);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth() + 1;

      return recordYear == year && recordMonth == month;
    } catch (e) {
      return false;
    }
  });

  // Group by date and merge records
  const groupedByDate = {};

  filteredData.forEach((row) => {
    const [nama, cabang, tanggal, masuk, pulang, status, keterangan] = row;

    if (!groupedByDate[tanggal]) {
      groupedByDate[tanggal] = {
        tanggal: tanggal,
        masuk: "",
        pulang: "",
        status: status || "",
        keterangan: keterangan || "",
      };
    }

    if (masuk && masuk.trim() !== "") {
      groupedByDate[tanggal].masuk = masuk;
    }
    if (pulang && pulang.trim() !== "") {
      groupedByDate[tanggal].pulang = pulang;
    }
    if (status && status.trim() !== "") {
      groupedByDate[tanggal].status = status;
    }
    if (keterangan && keterangan.trim() !== "") {
      groupedByDate[tanggal].keterangan = keterangan;
    }

    // Auto-set status to "Hadir" if both times exist
    if (
      groupedByDate[tanggal].masuk &&
      groupedByDate[tanggal].pulang &&
      groupedByDate[tanggal].masuk.trim() !== "" &&
      groupedByDate[tanggal].pulang.trim() !== ""
    ) {
      groupedByDate[tanggal].status = "Hadir";
    }
  });

  // Generate full month calendar (from 1st to last day of month)
  const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
  const lastDay = new Date(parseInt(year), parseInt(month), 0);
  const daysInMonth = lastDay.getDate();

  const fullMonthData = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, day);
    const dateString = formatDate(currentDate);
    const dayName = currentDate.toLocaleDateString("id-ID", {
      weekday: "long",
    });

    // Skip Sundays (weekday 0)
    if (currentDate.getDay() === 0) {
      continue;
    }

    if (groupedByDate[dateString]) {
      // Data exists for this date
      fullMonthData.push({
        tanggal: dateString,
        hari: dayName,
        masuk: groupedByDate[dateString].masuk,
        pulang: groupedByDate[dateString].pulang,
        status: groupedByDate[dateString].status,
        keterangan: groupedByDate[dateString].keterangan,
      });
    } else {
      // No data for this date - mark as absent
      fullMonthData.push({
        tanggal: dateString,
        hari: dayName,
        masuk: "-",
        pulang: "-",
        status: "Tidak Hadir",
        keterangan: "-",
      });
    }
  }

  return fullMonthData;
}
