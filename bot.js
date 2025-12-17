const fs = require('fs').promises;
const path = require('path');

class StatisticsBot {
  constructor() {
    this.statistikPath = path.join(__dirname, 'private', 'data', 'statistik.json');
    this.isRunning = false;
    this.botInterval = null;
    this.lastExecution = null;
  }

  // Generate random number between min and max (inclusive)
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate random increment for statistics (1-15 downloads)
  getRandomIncrement() {
    return this.getRandomInt(1, 15);
  }

  // Generate random interval in milliseconds (30 seconds - 5 minutes)
  getRandomInterval() {
    const minInterval = 30 * 1000; // 30 seconds in milliseconds
    const maxInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    return this.getRandomInt(minInterval, maxInterval);
  }

  // Update statistics with random increment
  async updateRandomStatistics() {
    try {
      const data = JSON.parse(await fs.readFile(this.statistikPath, 'utf8'));
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const month = now.toISOString().slice(0, 7);
      
      // Generate random increment
      const randomIncrement = this.getRandomIncrement();
      
      // Update total downloads
      data.totalDownloads = (data.totalDownloads || 0) + randomIncrement;
      
      // Update daily statistics
      if (!data.dailyStats) {
        data.dailyStats = {};
      }
      data.dailyStats[today] = (data.dailyStats[today] || 0) + randomIncrement;
      
      // Update monthly statistics
      if (!data.monthlyStats) {
        data.monthlyStats = {};
      }
      data.monthlyStats[month] = (data.monthlyStats[month] || 0) + randomIncrement;
      
      // Write updated data back to file
      await fs.writeFile(this.statistikPath, JSON.stringify(data, null, 2));
      
      // Log the update
      const timestamp = now.toLocaleString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      console.log(`🤖 [BOT] ${timestamp} - Statistik diperbarui: +${randomIncrement} download (Hari ini: ${data.dailyStats[today]}, Total: ${data.totalDownloads})`);
      
      this.lastExecution = now;
      
      return {
        success: true,
        increment: randomIncrement,
        todayStats: data.dailyStats[today],
        totalStats: data.totalDownloads
      };
      
    } catch (error) {
      console.error('❌ [BOT] Error updating statistics:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Start the bot
  async start() {
    if (this.isRunning) {
      console.log('⚠️ [BOT] Bot sudah berjalan...');
      return;
    }

    console.log('🚀 [BOT] Memulai bot statistik random...');
    
    // Perform initial update
    await this.updateRandomStatistics();
    
    // Set up recurring updates with random intervals
    this.isRunning = true;
    this.scheduleNextUpdate();
    
    console.log('✅ [BOT] Bot berhasil dimulai dan berjalan di background!');
  }

  // Schedule next update with random interval
  scheduleNextUpdate() {
    if (!this.isRunning) return;
    
    const interval = this.getRandomInterval();
    const nextExecution = new Date(Date.now() + interval);
    
    console.log(`⏰ [BOT] Update berikutnya dijadwalkan: ${nextExecution.toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })} (dalam ${Math.round(interval / 1000)} detik)`);
    
    this.botInterval = setTimeout(async () => {
      await this.updateRandomStatistics();
      this.scheduleNextUpdate(); // Schedule the next update
    }, interval);
  }

  // Stop the bot
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ [BOT] Bot belum berjalan...');
      return;
    }

    this.isRunning = false;
    
    if (this.botInterval) {
      clearTimeout(this.botInterval);
      this.botInterval = null;
    }
    
    console.log('🛑 [BOT] Bot telah dihentikan.');
  }

  // Get bot status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastExecution: this.lastExecution,
      nextExecution: this.botInterval ? new Date(Date.now() + (this.botInterval._idleTimeout || 0)).toLocaleString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) : null
    };
  }

  // Manual trigger for immediate update
  async triggerNow() {
    console.log('🔄 [BOT] Memicu update manual...');
    return await this.updateRandomStatistics();
  }
}

// Create and export bot instance
const statisticsBot = new StatisticsBot();

module.exports = statisticsBot;
