

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const cors = require('cors');
const { port } = require('./settings');
const statisticsBot = require('./bot');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Inisialisasi data statistik jika belum ada
const statistikPath = path.join(__dirname, 'private', 'data', 'statistik.json');
async function initStatistik() {
  try {
    await fs.access(statistikPath);
  } catch {
    const initialData = {
      totalDownloads: 0,
      dailyStats: {},
      monthlyStats: {}
    };
    await fs.mkdir(path.dirname(statistikPath), { recursive: true });
    await fs.writeFile(statistikPath, JSON.stringify(initialData, null, 2));
  }
}

// Update statistik
async function updateStatistik(type = 'download') {
  try {
    const data = JSON.parse(await fs.readFile(statistikPath, 'utf8'));
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const month = now.toISOString().slice(0, 7);
    
    data.totalDownloads++;
    
    // Update harian
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = 0;
    }
    data.dailyStats[today]++;
    
    // Update bulanan
    if (!data.monthlyStats[month]) {
      data.monthlyStats[month] = 0;
    }
    data.monthlyStats[month]++;
    
    await fs.writeFile(statistikPath, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

// Endpoint untuk download TikTok
app.get('/api/download', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        ok: false, 
        message: 'URL TikTok diperlukan' 
      });
    }
    
    // Validasi format URL TikTok
    const tiktokUrlPattern = /(https?:\/\/)?(www\.|vt\.|vm\.)?tiktok\.com\/(@[\w.-]+\/video\/\d+|[\w./?=&-]+)/i;
    if (!tiktokUrlPattern.test(url)) {
      return res.status(400).json({
        ok: false,
        message: 'Format URL TikTok tidak valid. Gunakan format seperti: https://vt.tiktok.com/ZSfsDhoBk/'
      });
    }
    
    // Gunakan endpoint yang Anda sediakan
    const apiUrl = `https://endpoint-hub.up.railway.app/api/downloader/tiktok?prompt=${encodeURIComponent(url)}`;
    console.log('Mengakses API:', apiUrl);
    
    const response = await axios.get(apiUrl, {
      timeout: 30000, // Timeout 30 detik
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Update statistik jika berhasil
    if (response.data && response.data.ok) {
      await updateStatistik();
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching TikTok data:', error.message);
    
    let errorMessage = 'Gagal mengambil data dari TikTok';
    let statusCode = 500;
    
    if (error.response) {
      // Server merespons dengan status error
      statusCode = error.response.status;
      errorMessage = `API merespons dengan status ${statusCode}`;
    } else if (error.request) {
      // Tidak ada respons dari server
      errorMessage = 'Tidak ada respons dari server TikTok API';
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      errorMessage = 'Waktu permintaan ke API habis. Silakan coba lagi.';
    }
    
    res.status(statusCode).json({ 
      ok: false, 
      message: errorMessage,
      details: error.message
    });
  }
});

// Endpoint untuk statistik
app.get('/api/statistik', async (req, res) => {
  try {
    const data = JSON.parse(await fs.readFile(statistikPath, 'utf8'));
    
    // Siapkan data untuk chart (7 hari terakhir)
    const dailyLabels = [];
    const dailyData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyLabels.push(dateStr);
      dailyData.push(data.dailyStats[dateStr] || 0);
    }
    
    // Data bulanan untuk chart
    const monthlyLabels = [];
    const monthlyData = [];
    
    // Ambil 6 bulan terakhir
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      monthlyLabels.push(monthStr);
      monthlyData.push(data.monthlyStats[monthStr] || 0);
    }
    
    res.json({
      ok: true,
      totalDownloads: data.totalDownloads || 0,
      dailyStats: {
        labels: dailyLabels,
        data: dailyData
      },
      monthlyStats: {
        labels: monthlyLabels,
        data: monthlyData
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    
    // Return data default jika file tidak ditemukan
    const now = new Date();
    const dailyLabels = [];
    const dailyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyLabels.push(dateStr);
      dailyData.push(0);
    }
    
    res.json({
      ok: true,
      totalDownloads: 0,
      dailyStats: {
        labels: dailyLabels,
        data: dailyData
      },
      monthlyStats: {
        labels: [],
        data: []
      }
    });
  }
});


// Endpoint untuk reset statistik (hanya untuk development)
app.post('/api/reset-statistik', async (req, res) => {
  try {
    const initialData = {
      totalDownloads: 0,
      dailyStats: {},
      monthlyStats: {}
    };
    
    await fs.writeFile(statistikPath, JSON.stringify(initialData, null, 2));
    res.json({ ok: true, message: 'Statistik berhasil direset' });
  } catch (error) {
    console.error('Error resetting statistics:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Gagal mereset statistik' 
    });
  }
});

// Bot control endpoints
app.post('/api/bot/start', async (req, res) => {
  try {
    await statisticsBot.start();
    res.json({ ok: true, message: 'Bot berhasil dimulai' });
  } catch (error) {
    console.error('Error starting bot:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Gagal memulai bot',
      error: error.message
    });
  }
});

app.post('/api/bot/stop', (req, res) => {
  try {
    statisticsBot.stop();
    res.json({ ok: true, message: 'Bot berhasil dihentikan' });
  } catch (error) {
    console.error('Error stopping bot:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Gagal menghentikan bot',
      error: error.message
    });
  }
});

app.get('/api/bot/status', (req, res) => {
  try {
    const status = statisticsBot.getStatus();
    res.json({ ok: true, status });
  } catch (error) {
    console.error('Error getting bot status:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Gagal mendapatkan status bot',
      error: error.message
    });
  }
});

app.post('/api/bot/trigger', async (req, res) => {
  try {
    const result = await statisticsBot.triggerNow();
    res.json({ 
      ok: true, 
      message: 'Bot berhasil ditriger manual',
      result 
    });
  } catch (error) {
    console.error('Error triggering bot:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Gagal menriger bot',
      error: error.message
    });
  }
});

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route untuk semua halaman SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    ok: false, 
    message: 'Terjadi kesalahan internal server' 
  });
});


// Jalankan server
async function startServer() {
  try {
    await initStatistik();
    
    // Start the statistics bot
    await statisticsBot.start();
    
    app.listen(port, () => {
      console.log(`=========================================`);
      console.log(`🚀 Server TikTok Downloader berjalan!`);
      console.log(`📡 Port: ${port}`);
      console.log(`🌐 URL: http://localhost:${port}`);
      console.log(`🕐 Waktu: ${new Date().toLocaleString()}`);
      console.log(`🤖 Bot statistik random aktif!`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Gagal memulai server:', error);
    process.exit(1);
  }
}

startServer();