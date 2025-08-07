/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"], // Sesuaikan path ini dengan struktur proyek Anda
  theme: {
    extend: {
      fontFamily: {
        // Daftarkan 'Poppins' sebagai font 'sans' utama kita
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
