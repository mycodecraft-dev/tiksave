# 🚀 Cara Menjalankan Website TikTok Downloader

## 📋 Persyaratan Sistem
- Node.js versi 16.0.0 atau lebih baru
- NPM (Node Package Manager)
- Browser modern (Chrome, Firefox, Safari, Edge)

## 🛠️ Langkah Instalasi

### 1. **Unduh/Clone Project**
```bash
# Jika menggunakan Git
git clone <repository-url>
cd tiktok-downloader

# Atau download ZIP dan extract
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Jalankan Server**
```bash
# Mode development (dengan auto-reload)
npm run dev

# Atau mode production
npm start
```

### 4. **Akses Website**
Buka browser dan akses: **http://localhost:3000**

## 🎯 Fitur Website

### ✅ **Download TikTok**
- Video tanpa watermark
- Video kualitas HD
- Musik terpisah (MP3)
- Gambar dari video
- **Tanpa membuka tab baru**
- **Nama file konsisten: `tiksave_content{id}.{ext}`**

### 📊 **Statistics Dashboard**
- Grafik downloads harian (7 hari terakhir)
- Grafik downloads bulanan (6 bulan terakhir)
- Total downloads
- Rata-rata downloads per hari

### 📱 **Responsive Design**
- Mobile-friendly
- Tablet support
- Desktop optimized

## 🔧 Konfigurasi

### **Mengubah Port**
Edit file `settings.js`:
```javascript
let port = 3000; // Ubah port sesuai kebutuhan
```

### **Environment Variables**
Buat file `.env` (opsional):
```env
PORT=3000
NODE_ENV=production
```

## 🐛 Troubleshooting

### **Error: Port Already in Use**
```bash
# Cek proses yang menggunakan port
lsof -i :3000

# Kill proses
kill -9 <PID>

# Atau ubah port di settings.js
```

### **Error: Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **API Error 404**
- Pastikan server berjalan di port yang benar
- Cek apakah file `server.js` ada
- Restart server: `npm start`

### **Download Error**
- Cek koneksi internet
- Pastikan URL TikTok valid
- Coba URL TikTok yang berbeda

## 📁 Struktur Project

```
tiktok-downloader/
├── public/              # Frontend files
│   ├── index.html      # Main page
│   ├── script.js       # JavaScript functions
│   └── favicon.ico     # Website icon
├── private/            # Private data
│   └── data/           # Statistics storage
├── server.js           # Main server file
├── settings.js         # Configuration
├── package.json        # Dependencies
└── README.md          # Documentation
```

## 🌐 API Endpoints

### **GET /api/download**
Download konten TikTok
```
GET /api/download?url=<tiktok-url>
```

### **GET /api/statistik**
Ambil data statistik
```
GET /api/statistik
```

### **POST /api/reset-statistik**
Reset statistik (development only)
```
POST /api/reset-statistik
```

## 🎨 Customization

### **Mengganti Logo/Brand**
- Edit `public/favicon.ico`
- Ganti teks di `index.html`

### **Mengubah Warna Tema**
Edit CSS di bagian `<style>` di `index.html`

### **Menambah Fitur**
- Tambah endpoint di `server.js`
- Tambah fungsi di `script.js`

## 📞 Support

Jika mengalami masalah:
1. Cek console browser (F12 → Console)
2. Cek terminal/server logs
3. Pastikan semua dependencies terinstall
4. Restart server dan browser

## 🔄 Development

```bash
# Jalankan dalam development mode
npm run dev

# Server akan auto-reload saat ada perubahan file
```

---

**Selamat menggunakan TikTok Downloader!** 🎉
