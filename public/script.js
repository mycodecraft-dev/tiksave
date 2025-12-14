
// ===== PERFORMANCE OPTIMIZATION =====
// Debounce function untuk optimasi performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function untuk touch events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== DOM Elements =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.getElementById('mainNav');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const tiktokUrlInput = document.getElementById('tiktok-url');
const downloadBtn = document.getElementById('download-btn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const resultContainer = document.getElementById('result-container');
const statsSummary = document.getElementById('stats-summary');

// ===== Chart Instances =====
let dailyChart = null;
let monthlyChart = null;


// ===== Lazy Loading Implementation =====
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const videos = document.querySelectorAll('video[data-src]');
    
    // Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.src = video.dataset.src;
                    video.load();
                    observer.unobserve(video);
                }
            });
        }, {
            rootMargin: '100px'
        });

        images.forEach(img => imageObserver.observe(img));
        videos.forEach(video => videoObserver.observe(video));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
        videos.forEach(video => {
            video.src = video.dataset.src;
            video.load();
        });
    }
}

// ===== Navigation with Performance Optimization =====
navLinks.forEach(link => {
    link.addEventListener('click', throttle((e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');

        // Update active menu
        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');

        // Show selected page
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
                // Scroll to top when switching pages
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Setup lazy loading for the new page
                setTimeout(() => {
                    setupLazyLoading();
                }, 100);
            }
        });

        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            mainNav.classList.remove('active');
        }

        // Load statistics if on statistics page
        if (pageId === 'statistics') {
            loadStatistics();
        }
    }, 150));
});

// Toggle mobile menu
mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mainNav.classList.remove('active');
    }
});

// ===== Download Functionality =====
downloadBtn.addEventListener('click', async () => {
    const url = tiktokUrlInput.value.trim();

    // Validate URL
    if (!url) {
        showError('Harap masukkan URL video TikTok');
        return;
    }

    // Reset previous state
    hideError();
    resultContainer.classList.remove('active');

    // Show loading
    loading.classList.add('active');

    try {
        // Send request to server
        const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // Hide loading
        loading.classList.remove('active');

        // Check if successful
        if (!data.ok) {
            showError(data.message || 'Gagal mengambil data video TikTok');
            return;
        }

        // Display result
        displayResult(data);
    } catch (error) {
        loading.classList.remove('active');
        showError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        console.error('Download error:', error);
    }
});

// ===== IMPROVED DOWNLOAD FUNCTION =====
// Download file directly without opening new tab
window.downloadFile = async function(fileUrl, filename, type = 'video') {
    try {
        // Add loading state to button
        const activeBtn = document.querySelector('.download-options .btn');
        if (activeBtn) {
            activeBtn.classList.add('download-btn-loading');
            const btnText = activeBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Mengunduh...';
        }

        // Generate unique ID for the content
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const contentId = `${timestamp}_${randomId}`;
        
        // Determine file extension based on type
        let extension = '';
        if (type === 'video') {
            extension = '.mp4';
        } else if (type === 'audio') {
            extension = '.mp3';
        } else if (type === 'image') {
            extension = '.jpg';
        }

        // Create final filename
        const finalFilename = `tiksave_content${contentId}${extension}`;
        
        // Fetch the file
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }

        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = finalFilename;
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => {
            window.URL.revokeObjectURL(downloadUrl);
        }, 1000);

        // Show success message
        showDownloadSuccess(finalFilename);
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Gagal mengunduh file. Silakan coba lagi.');
    } finally {
        // Remove loading state
        const activeBtn = document.querySelector('.download-options .btn');
        if (activeBtn) {
            activeBtn.classList.remove('download-btn-loading');
            const btnText = activeBtn.querySelector('.btn-text');
            if (btnText) {
                if (type === 'video') {
                    btnText.innerHTML = '<i class="fas fa-video"></i> Video (No Watermark)';
                } else if (type === 'audio') {
                    btnText.innerHTML = '<i class="fas fa-music"></i> Musik Terpisah';
                } else if (type === 'image') {
                    btnText.innerHTML = '<i class="fas fa-image"></i> Download Gambar';
                }
            }
        }
    }
};

// Show download success notification
function showDownloadSuccess(filename) {
    // Create success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        animation: slideInRight 0.5s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <div style="font-size: 0.875rem;">Berhasil diunduh!</div>
            <div style="font-size: 0.75rem; opacity: 0.9;">${filename}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 4000);
}


// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* Lazy loading styles */
    .lazy-image {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .lazy-image.loaded {
        opacity: 1;
    }
    
    /* Performance optimization */
    .video-player {
        will-change: transform;
    }
    
    /* Mobile touch optimization */
    @media (max-width: 768px) {
        .video-player,
        .lazy-image {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
    }
`;
document.head.appendChild(style);

// ===== VIDEO ASPECT RATIO DETECTION =====
function detectVideoAspectRatio(videoUrl) {
    return new Promise((resolve) => {
        // Cek jika videoUrl valid
        if (!videoUrl || videoUrl === '') {
            resolve({
                width: 1080,
                height: 1920,
                aspectRatio: 0.5625,
                ratioClass: 'portrait'
            });
            return;
        }

        const video = document.createElement('video');
        video.src = videoUrl;
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';

        // Timeout untuk mencegah hanging
        const timeout = setTimeout(() => {
            video.remove();
            resolve({
                width: 1080,
                height: 1920,
                aspectRatio: 0.5625,
                ratioClass: 'portrait'
            });
        }, 5000);

        video.onloadedmetadata = () => {
            clearTimeout(timeout);
            const width = video.videoWidth;
            const height = video.videoHeight;
            const aspectRatio = width / height;

            let ratioClass = 'portrait';

            // Deteksi rasio aspek
            if (aspectRatio >= 1.7) {
                ratioClass = 'landscape'; // 16:9 atau lebih lebar
            } else if (aspectRatio >= 0.95 && aspectRatio <= 1.05) {
                ratioClass = 'square'; // 1:1 (0.95-1.05)
            } else if (aspectRatio >= 0.75 && aspectRatio <= 0.85) {
                ratioClass = 'ratio-4-5'; // 4:5 (0.8)
            } else if (aspectRatio <= 0.65) {
                ratioClass = 'portrait'; // 9:16 atau lebih tinggi
            } else {
                // Untuk rasio lain, gunakan yang paling mendekati
                if (Math.abs(aspectRatio - 0.8) < Math.abs(aspectRatio - 0.5625)) {
                    ratioClass = 'ratio-4-5';
                } else {
                    ratioClass = 'portrait';
                }
            }

            video.remove();
            resolve({
                width,
                height,
                aspectRatio,
                ratioClass
            });
        };

        video.onerror = () => {
            clearTimeout(timeout);
            video.remove();
            resolve({
                width: 1080,
                height: 1920,
                aspectRatio: 0.5625,
                ratioClass: 'portrait'
            });
        };
    });
}

// Perbarui fungsi displayResult untuk menggunakan rasio aspek yang terdeteksi
async function displayResult(data) {
    let html = '';

    if (data.type === 'video') {
        // Deteksi rasio aspek video
        let ratioClass = 'portrait'; // default
        let detectedWidth = 1080;
        let detectedHeight = 1920;

        try {
            const videoInfo = await detectVideoAspectRatio(data.video.no_watermark);
            ratioClass = videoInfo.ratioClass;
            detectedWidth = videoInfo.width;
            detectedHeight = videoInfo.height;

            console.log(`Video detected: ${detectedWidth}x${detectedHeight}, ratio: ${videoInfo.aspectRatio}, class: ${ratioClass}`);
        } catch (error) {
            console.log('Gagal mendeteksi rasio aspek video:', error);
        }

        html = `
        <div class="download-card">
            <h3 class="text-center mb-4"><i class="fas fa-check-circle text-success"></i> Video Siap Diunduh!</h3>
            
            <div class="media-preview">
                <div class="video-player-container ${ratioClass}">
                    <video class="video-player" id="video-player" poster="${data.video.cover}">
                        <source src="${data.video.no_watermark}" type="video/mp4">
                        Browser Anda tidak mendukung pemutaran video.
                    </video>
                    <div class="play-overlay">
                        <button class="play-btn" id="play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                
                <div class="media-info">
                    <h4 class="mb-3"><i class="fas fa-info-circle text-primary"></i> Informasi Video</h4>
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-heading"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Judul</span>
                            <span class="font-semibold">${data.video.title || 'Tidak tersedia'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Pembuat Konten</span>
                            <span class="font-semibold">${data.video.author || 'Tidak tersedia'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Region</span>
                            <span class="font-semibold">${data.video.region || 'Tidak tersedia'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Creator Endpoint</span>
                            <span class="font-semibold">${data.creator || 'Tidak tersedia'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-expand"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Resolusi</span>
                            <span class="font-semibold">${detectedWidth} × ${detectedHeight} (${ratioClass})</span>
                        </div>
                    </div>
                </div>
            </div>
            

            <h4 class="mt-6 mb-3"><i class="fas fa-download text-primary"></i> Pilihan Download</h4>
            <div class="download-progress" id="download-progress">
                <div class="download-progress-bar" id="download-progress-bar"></div>
            </div>
            <div class="download-options">
                <button onclick="downloadFile('${data.video.no_watermark}', 'tiksave_content${data.video.id || Date.now()}', 'video')" class="btn btn-primary" data-type="video">
                    <span class="btn-text"><i class="fas fa-video"></i> Video (No Watermark)</span>
                </button>
                <button onclick="downloadFile('${data.video.no_watermark_hd}', 'tiksave_content${data.video.id || Date.now()}_hd', 'video')" class="btn btn-secondary" data-type="video">
                    <span class="btn-text"><i class="fas fa-hd"></i> Video HD</span>
                </button>
                <button onclick="downloadFile('${data.video.music}', 'tiksave_content${data.video.id || Date.now()}_music', 'audio')" class="btn btn-outline" data-type="audio">
                    <span class="btn-text"><i class="fas fa-music"></i> Musik Terpisah</span>
                </button>
            </div>
            
            <div class="mt-4 text-center">
                <button class="btn btn-sm" onclick="resetForm()">
                    <i class="fas fa-redo"></i> Download Video Lain
                </button>
            </div>
        </div>
    `;
    } else {
        // Untuk konten gambar
        html = `
        <div class="download-card">
            <h3 class="text-center mb-4"><i class="fas fa-check-circle text-success"></i> Konten Siap Diunduh!</h3>
            
            <div class="media-preview">
                <div class="image-container">
                    <img src="${data.image || data.cover || data.images || ''}" 
                         alt="Preview" 
                         class="video-player"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/500x500?text=Image+Not+Available'">
                </div>
                
                <div class="media-info">
                    <h4 class="mb-3"><i class="fas fa-info-circle text-primary"></i> Informasi Konten</h4>
                    ${data.title ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-heading"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Judul</span>
                            <span class="font-semibold">${data.title}</span>
                        </div>
                    </div>
                    ` : ''}
                    ${data.author ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Pembuat</span>
                            <span class="font-semibold">${data.author}</span>
                        </div>
                    </div>
                    ` : ''}
                    ${data.region ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Region</span>
                            <span class="font-semibold">${data.region}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="download-options">
                ${data.image || data.cover || data.images ? `
                <button onclick="downloadFile('${data.image || data.cover || data.images}', 'tiksave_content${data.video.id || Date.now()}_image', 'image')" class="btn btn-primary" data-type="image">
                    <span class="btn-text"><i class="fas fa-image"></i> Download Gambar</span>
                </button>
                ` : ''}
                ${data.music ? `
                <button onclick="downloadFile('${data.music}', 'tiksave_content${data.video.id || Date.now()}_music', 'audio')" class="btn btn-secondary" data-type="audio">
                    <span class="btn-text"><i class="fas fa-music"></i> Download Musik</span>
                </button>
                ` : ''}
            </div>
            
            <div class="mt-4 text-center">
                <button class="btn btn-sm" onclick="resetForm()">
                    <i class="fas fa-redo"></i> Download Konten Lain
                </button>
            </div>
        </div>
    `;
    }

    resultContainer.innerHTML = html;
    resultContainer.classList.add('active');

    // Add event listeners for video controls
    const playBtn = document.getElementById('play-btn');
    const videoPlayer = document.getElementById('video-player');

    if (playBtn && videoPlayer) {
        playBtn.addEventListener('click', () => {
            if (videoPlayer.paused) {
                videoPlayer.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                videoPlayer.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        videoPlayer.addEventListener('play', () => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });

        videoPlayer.addEventListener('pause', () => {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        // Auto-play ketika video siap
        videoPlayer.addEventListener('loadeddata', () => {
            // Optional: auto-play setelah sedikit delay
            setTimeout(() => {
                // videoPlayer.play().catch(e => console.log('Auto-play prevented:', e));
            }, 500);
        });
    }

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Reset form function
window.resetForm = function () {
    tiktokUrlInput.value = '';
    resultContainer.classList.remove('active');
    tiktokUrlInput.focus();
};

// ===== Statistics Functions =====
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistik');
        const data = await response.json();

        if (!data.ok) {
            console.error('Gagal memuat statistik');
            return;
        }

        // Update statistics summary
        updateStatsSummary(data);

        // Create charts
        createCharts(data);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function updateStatsSummary(data) {
    const totalDownloads = data.totalDownloads || 0;
    const today = new Date().toISOString().split('T')[0];
    const todayDownloads = data.dailyStats?.data?.[data.dailyStats.data.length - 1] || 0;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthDownloads = data.monthlyStats?.data?.[data.monthlyStats.data.length - 1] || 0;
    const dailyAvg = Math.round(data.dailyStats?.data?.reduce((a, b) => a + b, 0) / (data.dailyStats?.data?.length || 1));

    statsSummary.innerHTML = `
        <div class="stat-card card">
            <i class="fas fa-download text-primary text-2xl"></i>
            <h3>Total Downloads</h3>
            <div class="stat-number">${totalDownloads.toLocaleString()}</div>
            <p class="text-gray">Semua waktu</p>
        </div>
        
        <div class="stat-card card">
            <i class="fas fa-calendar-day text-primary text-2xl"></i>
            <h3>Hari Ini</h3>
            <div class="stat-number">${todayDownloads.toLocaleString()}</div>
            <p class="text-gray">Downloads hari ini</p>
        </div>
        
        <div class="stat-card card">
            <i class="fas fa-calendar-alt text-primary text-2xl"></i>
            <h3>Bulan Ini</h3>
            <div class="stat-number">${thisMonthDownloads.toLocaleString()}</div>
            <p class="text-gray">Downloads bulan ini</p>
        </div>
        
        <div class="stat-card card">
            <i class="fas fa-chart-line text-primary text-2xl"></i>
            <h3>Rata-rata</h3>
            <div class="stat-number">${dailyAvg.toLocaleString()}</div>
            <p class="text-gray">Per hari (7 hari)</p>
        </div>
    `;
}

function createCharts(data) {
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');

    // Destroy previous charts if they exist
    if (dailyChart) dailyChart.destroy();
    if (monthlyChart) monthlyChart.destroy();

    // Daily chart
    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: data.dailyStats?.labels || [],
            datasets: [{
                label: 'Downloads',
                data: data.dailyStats?.data || [],
                borderColor: '#ff0050',
                backgroundColor: 'rgba(255, 0, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff0050',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 15, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#e0e0e0',
                    borderColor: '#ff0050',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaaaaa',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaaaaa',
                        font: {
                            size: 11
                        },
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Monthly chart
    monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: data.monthlyStats?.labels || [],
            datasets: [{
                label: 'Downloads',
                data: data.monthlyStats?.data || [],
                backgroundColor: 'rgba(0, 242, 234, 0.7)',
                borderColor: '#00f2ea',
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(0, 242, 234, 0.9)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 15, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#e0e0e0',
                    borderColor: '#00f2ea',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaaaaa',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaaaaa',
                        font: {
                            size: 11
                        },
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// ===== Error Handling =====
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('active');
    errorMessage.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    errorMessage.classList.remove('active');
}


// ===== Event Listeners with Performance Optimization =====
const debouncedDownload = debounce(() => {
    downloadBtn.click();
}, 500);

tiktokUrlInput.addEventListener('input', throttle((e) => {
    // Auto-detect URL format and provide feedback
    const url = e.target.value.trim();
    if (url && !url.includes('tiktok.com') && !url.includes('vt.tiktok.com')) {
        // URL validation feedback could be added here
    }
}, 300));

tiktokUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        debouncedDownload();
    }
});

// Enhanced mobile menu toggle with touch optimization
mobileMenuBtn.addEventListener('click', throttle(() => {
    mainNav.classList.toggle('active');
}, 200));

// Focus URL input on page load
tiktokUrlInput.focus();

// Load statistics if on statistics page on initial load
document.addEventListener('DOMContentLoaded', () => {
    // Check URL hash for page
    if (window.location.hash) {
        const pageId = window.location.hash.substring(1);
        const link = document.querySelector(`[data-page="${pageId}"]`);
        if (link) link.click();
    }

    // Load statistics if on statistics page
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'statistics-page') {
        loadStatistics();
    }
});

// Update statistics every 30 seconds when on statistics page
setInterval(() => {
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'statistics-page') {
        loadStatistics();
    }
}, 30000);
