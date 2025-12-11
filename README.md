# README.md - TikTok Downloader

# TikTok Downloader

Website untuk mengunduh video TikTok tanpa watermark dengan mudah dan gratis. Dibangun dengan Express.js dan antarmuka web yang responsif.

## 🌟 Fitur Utama

- ✅ Unduh video TikTok tanpa watermark
- ✅ Kualitas HD (High Definition)
- ✅ Unduh audio/musik terpisah
- ✅ Antarmuka responsive (Desktop & Mobile)
- ✅ Statistik penggunaan real-time
- ✅ Dokumentasi API lengkap
- ✅ Gratis, tanpa registrasi/login
- ✅ No tracking, privasi terjaga

## 🚀 Demo

Website tersedia di: `http://localhost:8080`

## 📋 Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda memiliki:
- Node.js (versi 16 atau lebih tinggi)
- NPM (Node Package Manager)
- Koneksi internet untuk mengakses API TikTok

## ⚙️ Instalasi

### 1. Clone/Download Proyek

```bash
git clone https://github.com/fareldev-hub/tiktok-downloader
cd tiktok-downloader
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi

Port server dapat diubah di file `settings.js`:
```javascript
// settings.js
let port = 8080;  // Ubah port sesuai kebutuhan
module.exports = { port };
```

### 4. Jalankan Server

```bash
npm start
```

Untuk development dengan auto-restart:
```bash
npm run dev
```

### 5. Akses Website

Buka browser dan kunjungi:
```
http://localhost:8080
```

## 📁 Struktur Proyek

```
tiktok-downloader/
├── server.js              # Server utama Express.js
├── settings.js            # Konfigurasi port server
├── package.json           # Dependencies dan scripts
├── package-lock.json      # Lock file untuk dependencies
├── public/
│   └── index.html         # Frontend website (single page application)
└── private/
    └── data/
        └── statistik.json # Database statistik penggunaan (auto-generated)
```

## 🔧 API Endpoints

### 1. Download Video TikTok

**Endpoint:**
```
GET /api/download?url={URL_TIKTOK}
```

**Parameter:**
| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `url` | String | ✅ Ya | URL video TikTok yang valid |

**Contoh Request:**
```bash
curl "http://localhost:8080/api/download?url=https://vt.tiktok.com/ZSfsDhoBk/"
```

**Contoh Response Sukses:**
```json
{
  "ok": true,
  "type": "video",
  "creator": "Farel Alfareza",
  "prompt": "https://vt.tiktok.com/ZSfsDhoBk/",
  "video": {
    "title": "arti arti secret kode #fyp",
    "author": "5 DESEMBER GUE ULTAH",
    "region": "ID",
    "cover": "https://p16-sign-va.tiktokcdn.com/...",
    "no_watermark": "https://v16m.tiktokcdn.com/...",
    "no_watermark_hd": "https://v16m-default.tiktokcdn.com/...",
    "music": "https://v19-ies-music.tiktokcdn.com/..."
  }
}
```

**Response Error:**
```json
{
  "ok": false,
  "message": "Format URL TikTok tidak valid"
}
```

### 2. Get Statistics

**Endpoint:**
```
GET /api/statistik
```

**Contoh Response:**
```json
{
  "ok": true,
  "totalDownloads": 1250,
  "dailyStats": {
    "labels": ["2023-12-05", "2023-12-06", "2023-12-07"],
    "data": [45, 67, 89]
  },
  "monthlyStats": {
    "labels": ["2023-07", "2023-08", "2023-09"],
    "data": [450, 520, 600]
  }
}
```

## 💻 Contoh Penggunaan API

### JavaScript (Frontend)
```javascript
// Menggunakan Fetch API
fetch('/api/download?url=https://vt.tiktok.com/ZSfsDhoBk/')
  .then(response => response.json())
  .then(data => {
    if (data.ok) {
      console.log('Video Title:', data.video.title);
      console.log('Download URL:', data.video.no_watermark);
    }
  })
  .catch(error => console.error('Error:', error));
```

### Python
```python
import requests

# Download video
response = requests.get(
    'http://localhost:8080/api/download',
    params={'url': 'https://vt.tiktok.com/ZSfsDhoBk/'}
)

if response.status_code == 200:
    data = response.json()
    if data.get('ok'):
        print(f"Title: {data['video']['title']}")
        print(f"Download URL: {data['video']['no_watermark']}")
```

### PHP
```php
<?php
// Get video data
$url = 'https://vt.tiktok.com/ZSfsDhoBk/';
$api_url = "http://localhost:8080/api/download?url=" . urlencode($url);

$response = file_get_contents($api_url);
$data = json_decode($response, true);

if ($data['ok']) {
    echo "Title: " . $data['video']['title'] . "\n";
    echo "Download URL: " . $data['video']['no_watermark'] . "\n";
}
?>
```

### cURL (Command Line)
```bash
# Download video
curl "http://localhost:8080/api/download?url=https://vt.tiktok.com/ZSfsDhoBk/"

# Get statistics
curl "http://localhost:8080/api/statistik"
```

## 🎨 Halaman Website

### 1. Home Page
- Input URL TikTok
- Preview video
- Tombol download (video, video HD, audio)
- Fitur auto-play untuk preview

### 2. About Page
- Informasi tentang website
- Cara kerja sistem
- API yang digunakan
- Kebijakan privasi

### 3. Donation Page
- Link ke Saweria
- Link ke Trakteer
- Informasi dukungan pengembangan

### 4. Statistics Page
- Total downloads
- Statistik 7 hari terakhir
- Statistik 6 bulan terakhir
- Grafik interaktif

### 5. Documentation Page
- Dokumentasi API endpoints
- Contoh kode berbagai bahasa
- Parameter dan response format

## 📱 Teknologi yang Digunakan

### Backend:
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **Axios** - HTTP client untuk API requests
- **CORS** - Cross-Origin Resource Sharing

### Frontend:
- **HTML5** - Struktur halaman
- **CSS3** - Styling dengan custom properties
- **JavaScript (Vanilla)** - Interaktivitas
- **Chart.js** - Visualisasi data statistik
- **Font Awesome** - Ikon vektor

### API Eksternal:
- **Endpoint Hub** - `https://endpoint-hub.up.railway.app/api/downloader/tiktok`

## 🔒 Keamanan & Privasi

1. **Tidak menyimpan data pribadi**
2. **Tidak ada tracking pengguna**
3. **Tanpa registrasi/login**
4. **Koneksi aman (jika menggunakan HTTPS)**
5. **URL video tidak disimpan permanen**

## 🐛 Troubleshooting

### Masalah Umum:

1. **Port 8080 sudah digunakan**
   ```bash
   # Cek proses yang menggunakan port 8080
   netstat -ano | findstr :8080
   
   # Atau ubah port di settings.js
   ```

2. **Video tidak bisa diunduh**
   - Pastikan URL TikTok valid
   - Cek koneksi internet
   - Periksa console error di browser

3. **API tidak merespons**
   - Pastikan server berjalan
   - Cek apakah endpoint API masih aktif
   - Periksa log server untuk error

4. **Statistik tidak muncul**
   - Pastikan folder `private/data/` ada
   - Cek permission folder
   - Server akan membuat file otomatis saat pertama dijalankan

## 📊 Database Statistik

Statistik disimpan di `private/data/statistik.json`:
```json
{
  "totalDownloads": 0,
  "dailyStats": {},
  "monthlyStats": {}
}
```

Data otomatis bertambah setiap kali ada download berhasil.

## 🤝 Kontribusi

Kontribusi sangat diterima! Ikuti langkah berikut:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Dukungan

Jika project ini membantu Anda, pertimbangkan untuk memberikan dukungan:

- [Saweria](https://saweria.co/fareldeveloper)
- [Trakteer](https://trakteer.id/farel_alfarez/gift)

## ⚠️ Disclaimer

Proyek ini hanya untuk tujuan pendidikan dan penggunaan pribadi. Harap hormati hak cipta konten dan gunakan dengan bertanggung jawab. Pengembang tidak bertanggung jawab atas penyalahgunaan tool ini.

## 📞 Kontak

Farel Developer - [@Fareldev-hub](https://github.com/Fareldev-hub)

Link Project: [https://github.com/Fareldev-hub/tiktok-downloader](https://github.com/Fareldev-hub/tiktok-downloader)
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Start in development mode
npm run dev

# Check server status
curl http://localhost:8080/api/statistik

# Test API endpoint
curl "http://localhost:8080/api/download?url=https://vt.tiktok.com/ZSfsDhoBk/"
```

## 🌐 Deployment

Untuk deploy ke production:

1. **Railway.app**
   ```bash
   railway up
   ```

2. **Heroku**
   ```bash
   heroku create
   git push heroku main
   ```

3. **Vercel**
   ```bash
   vercel --prod
   ```

4. **Manual Server**
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   
   # Start with PM2
   pm2 start server.js --name "tiktok-downloader"
   
   # Save PM2 process list
   pm2 save
   
   # Setup PM2 to start on boot
   pm2 startup
   ```

## 🔄 Fitur yang Akan Datang

- [ ] Download multiple videos
- [ ] Batch processing
- [ ] Chrome extension
- [ ] Telegram bot
- [ ] REST API dengan authentication
- [ ] Support untuk platform lain (YouTube, Instagram, dll)

---

**Note**: Pastikan untuk mengikuti Terms of Service TikTok saat menggunakan tool ini. Penggunaan untuk konten copyrighted tanpa izin mungkin melanggar hukum.

**Last Updated**: December 2023

**Version**: 1.0.0
```

File README.md ini memberikan panduan lengkap untuk:
1. **Instalasi dan setup** - Langkah demi langkah cara menjalankan proyek
2. **Penggunaan API** - Dokumentasi lengkap endpoint dengan contoh berbagai bahasa
3. **Struktur proyek** - Penjelasan file dan folder
4. **Troubleshooting** - Solusi untuk masalah umum
5. **Deployment** - Cara deploy ke berbagai platform
6. **Contoh kode** - Implementasi dalam JavaScript, Python, PHP, dan cURL

## Review website : [Lihat website](https://tiktok-hub-downloader.up.railway.app)