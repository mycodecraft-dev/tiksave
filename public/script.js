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




// ===== SIDEBAR MANAGEMENT =====
class SidebarManager {
    constructor() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mainNav = document.getElementById('mainNav');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.footerLinks = document.querySelectorAll('.footer-links a');
        this.pages = document.querySelectorAll('.page');
        this.isMenuOpen = false;
        this.isTransitioning = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
        this.setupAccessibility();
        this.setupFooterLinks();
        this.setupStatisticsAutoRefresh();
        this.handleInitialLoad();
    }

    setupEventListeners() {
        // Mobile menu toggle - FIXED: Removed duplicate listeners
        this.mobileMenuBtn.addEventListener('click', this.throttle((e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu();
        }, 150));

        // Navigation links
        this.navLinks.forEach((link, index) => {
            link.addEventListener('click', this.throttle((e) => {
                e.preventDefault();
                this.navigateToPage(link);
            }, 100));

            // Enhanced touch support
            link.addEventListener('touchstart', (e) => {
                this.addTouchFeedback(e.target);
            }, { passive: true });

            link.addEventListener('touchend', (e) => {
                this.removeTouchFeedback(e.target);
            }, { passive: true });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.mainNav.contains(e.target) && !this.mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
                this.mobileMenuBtn.focus();
            }
        });
    }

    setupKeyboardNavigation() {
        this.navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        this.navigateToPage(link);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.focusNextNavItem(index);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.focusPrevNavItem(index);
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.focusNavItem(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.focusNavItem(this.navLinks.length - 1);
                        break;
                }
            });
        });
    }

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        this.mainNav.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        this.mainNav.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipeGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }


    setupAccessibility() {
        // Set ARIA attributes
        this.mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        this.mobileMenuBtn.setAttribute('aria-controls', 'mainNav');

        this.mainNav.setAttribute('role', 'navigation');
        this.mainNav.setAttribute('aria-label', 'Main navigation');

        this.navLinks.forEach((link, index) => {
            link.setAttribute('role', 'menuitem');
            link.setAttribute('tabindex', index === 0 ? '0' : '-1');
            
            // Add screen reader only text for better context
            const pageName = link.getAttribute('data-page');
            if (!link.querySelector('.sr-only')) {
                const srText = document.createElement('span');
                srText.className = 'sr-only';
                srText.textContent = `Navigate to ${pageName} page`;
                link.appendChild(srText);
            }

        });
    }

    setupFooterLinks() {
        // Setup event listeners for footer links
        this.footerLinks.forEach((link, index) => {
            link.addEventListener('click', this.throttle((e) => {
                e.preventDefault();
                this.navigateToPage(link);
            }, 100));

            // Enhanced touch support
            link.addEventListener('touchstart', (e) => {
                this.addTouchFeedback(e.target);
            }, { passive: true });

            link.addEventListener('touchend', (e) => {
                this.removeTouchFeedback(e.target);
            }, { passive: true });

            // Keyboard navigation support
            link.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        this.navigateToPage(link);
                        break;
                }
            });
        });
    }

    setupStatisticsAutoRefresh() {
        // Update statistics every 30 seconds when on statistics page
        setInterval(() => {
            const activePage = document.querySelector('.page.active');
            if (activePage && activePage.id === 'statistics-page') {
                loadStatistics();
            }
        }, 30000);
    }

    handleInitialLoad() {
        // Check URL hash for page
        if (window.location.hash) {
            const pageId = window.location.hash.substring(1);
            const link = document.querySelector(`[data-page="${pageId}"]`);
            if (link) {
                this.navigateToPage(link, false);
            }
        }

        // Load statistics if on statistics page
        const activePage = document.querySelector('.page.active');
        if (activePage && activePage.id === 'statistics-page') {
            loadStatistics();
        }
    }

    navigateToPage(link, updateHash = true) {
        if (this.isTransitioning) return;
        
        const pageId = link.getAttribute('data-page');
        if (!pageId) return;

        this.isTransitioning = true;

        // Update active states
        this.updateActiveStates(link);

        // Show selected page with animation
        this.showPage(pageId);

        // Close mobile menu if open
        if (this.isMenuOpen && window.innerWidth <= 768) {
            this.closeMobileMenu();
        }

        // Update URL hash
        if (updateHash) {
            window.history.pushState(null, null, `#${pageId}`);
        }

        // Load statistics if needed
        if (pageId === 'statistics') {
            setTimeout(() => loadStatistics(), 100);
        }

        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }


    updateActiveStates(activeLink) {
        // Update nav links
        this.navLinks.forEach(nav => {
            nav.classList.remove('active');
            nav.setAttribute('aria-current', 'false');
        });
        
        // Update footer links
        this.footerLinks.forEach(footer => {
            footer.classList.remove('active');
            footer.setAttribute('aria-current', 'false');
        });
        
        // Set active state for the clicked link
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
        
        // Sync active states between header and footer
        this.syncActiveStates(activeLink.getAttribute('data-page'));
    }


    syncActiveStates(pageId) {
        // Sync active states between header and footer navigation
        if (pageId) {
            // Find corresponding links in header and footer
            const headerLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
            const footerLink = document.querySelector(`.footer-links a[data-page="${pageId}"]`);
            
            // Update header link
            if (headerLink) {
                this.navLinks.forEach(nav => {
                    nav.classList.remove('active');
                    nav.setAttribute('aria-current', 'false');
                });
                headerLink.classList.add('active');
                headerLink.setAttribute('aria-current', 'page');
            }
            
            // Update footer link
            if (footerLink) {
                this.footerLinks.forEach(footer => {
                    footer.classList.remove('active');
                    footer.setAttribute('aria-current', 'false');
                });
                footerLink.classList.add('active');
                footerLink.setAttribute('aria-current', 'page');
            }
        }
    }

    showPage(pageId) {
        this.pages.forEach(page => {
            page.classList.remove('active');
            page.setAttribute('aria-hidden', 'true');
            
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
                page.setAttribute('aria-hidden', 'false');
                
                // Smooth scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Setup lazy loading for the new page
                setTimeout(() => {
                    setupLazyLoading();
                }, 100);
            }
        });
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.mainNav.classList.add('active');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
        
        // Change icon
        const icon = this.mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-times';
        }

        // Focus first nav item
        setTimeout(() => {
            const firstNavItem = this.navLinks[0];
            if (firstNavItem) {
                firstNavItem.focus();
            }
        }, 100);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mainNav.classList.remove('active');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        
        // Change icon back
        const icon = this.mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }

        // Restore body scroll
        document.body.style.overflow = '';
    }

    focusNextNavItem(currentIndex) {
        const nextIndex = (currentIndex + 1) % this.navLinks.length;
        this.focusNavItem(nextIndex);
    }

    focusPrevNavItem(currentIndex) {
        const prevIndex = currentIndex === 0 ? this.navLinks.length - 1 : currentIndex - 1;
        this.focusNavItem(prevIndex);
    }

    focusNavItem(index) {
        // Remove focus from all items
        this.navLinks.forEach(link => link.setAttribute('tabindex', '-1'));
        
        // Focus target item
        const targetItem = this.navLinks[index];
        if (targetItem) {
            targetItem.setAttribute('tabindex', '0');
            targetItem.focus();
        }
    }

    handleSwipeGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - close menu
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }
            // Note: Left swipe to open menu might interfere with scrolling, so we skip it
        }
    }

    addTouchFeedback(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.1s ease';
    }

    removeTouchFeedback(element) {
        setTimeout(() => {
            element.style.transform = '';
            element.style.transition = '';
        }, 100);
    }

    // Utility functions
    throttle(func, limit) {
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

    debounce(func, wait) {
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
}

// Initialize sidebar manager
const sidebarManager = new SidebarManager();

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
                    btnText.innerHTML = '<i class="fas fa-hd"></i> Video HD';
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



// Add CSS animations and accessibility styles
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
    
    /* ===== SIDEBAR ACCESSIBILITY & IMPROVEMENTS ===== */
    
    /* Screen reader only text */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    /* Enhanced focus indicators */
    .nav-link:focus,
    .mobile-menu-btn:focus {
        outline: 2px solid #ff0050;
        outline-offset: 2px;
        border-radius: 4px;
    }
    
    /* Better touch targets for mobile */
    .nav-link {
        min-height: 44px;
        display: flex;
        align-items: center;
        position: relative;
        transition: all 0.2s ease;
    }
    
    /* Touch feedback animation */
    .nav-link:active {
        transform: scale(0.98);
        background-color: rgba(255, 0, 80, 0.1);
    }
    
    /* Mobile menu improvements */
    .main-nav {
        will-change: transform, opacity;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .main-nav.active {
        transform: translateX(0);
    }
    
    /* Prevent text selection on nav items */
    .nav-link {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .nav-link.active {
            background-color: #ffffff;
            color: #000000;
            font-weight: bold;
        }
        
        .mobile-menu-btn {
            border: 2px solid #ffffff;
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .mainNav {
            transition: none;
        }
        
        .nav-link {
            transition: none;
        }
        
        .nav-link:active {
            transform: none;
        }
        
        /* Disable animations for notifications */
        @keyframes slideInRight,
        @keyframes slideOutRight {
            animation: none;
        }
    }
    
    /* Better keyboard navigation */
    .nav-link[tabindex="0"] {
        background-color: rgba(255, 0, 80, 0.1);
        border-left: 3px solid #ff0050;
    }
    
    /* Loading state improvements */
    .mobile-menu-btn.loading {
        pointer-events: none;
        opacity: 0.7;
    }
    
    /* Smooth scroll behavior */
    html {
        scroll-behavior: smooth;
    }
    
    /* Better mobile scrolling */
    body {
        -webkit-overflow-scrolling: touch;
        overflow-x: hidden;
    }
    
    /* Focus trap for mobile menu */
    .main-nav.active {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.95);
        overflow-y: auto;
    }
    

    /* Prevent background scroll when menu is open */
    body.menu-open {
        overflow: hidden;
        position: fixed;
        width: 100%;
    }
    
    /* ===== FOOTER LINKS STYLING ===== */
    
    /* Footer links styling */
    .footer-links a {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
        color: var(--text-secondary);
        text-decoration: none;
        transition: all 0.2s ease;
        border-radius: 6px;
        min-height: 44px;
        position: relative;
    }
    
    .footer-links a:hover {
        color: var(--primary);
        background-color: rgba(255, 0, 80, 0.1);
        transform: translateX(4px);
    }
    
    .footer-links a.active {
        color: var(--primary);
        background-color: rgba(255, 0, 80, 0.15);
        border-left: 3px solid var(--primary);
        padding-left: 0.75rem;
    }
    
    .footer-links a:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }
    
    .footer-links a:active {
        transform: scale(0.98);
        background-color: rgba(255, 0, 80, 0.2);
    }
    
    /* Better mobile touch targets for footer */
    @media (max-width: 768px) {
        .footer-links a {
            min-height: 48px;
            padding: 0.75rem 0;
        }
    }
    
    /* Prevent text selection on footer links */
    .footer-links a {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    /* Accessibility improvements for footer */
    @media (prefers-contrast: high) {
        .footer-links a.active {
            background-color: #ffffff;
            color: #000000;
            font-weight: bold;
        }
    }
    
    /* Reduced motion support for footer */
    @media (prefers-reduced-motion: reduce) {
        .footer-links a {
            transition: none;
        }
        
        .footer-links a:hover,
        .footer-links a:active {
            transform: none;
        }
    }
`;
document.head.appendChild(style);



// ===== CONTENT TYPE DETECTION =====
function detectContentType(data) {
    const contentInfo = {
        type: 'unknown',
        hasVideo: false,
        hasAudio: false,
        hasImages: false,
        videoUrls: [],
        audioUrls: [],
        imageUrls: [],
        coverUrl: '',
        canDownloadVideo: false,
        canDownloadAudio: false,
        canDownloadImages: false
    };

    try {
        // Debug: log data yang diterima
        console.log('Data received for detection:', JSON.stringify(data, null, 2));

        // Deteksi dari data.type jika ada
        if (data.type) {
            if (data.type === 'video') contentInfo.type = 'video';
            else if (data.type === 'image' || data.type === 'photo') contentInfo.type = 'image';
            else if (data.type === 'audio') contentInfo.type = 'audio';
        }

        // Deteksi video
        if (data.video) {
            contentInfo.hasVideo = true;
            contentInfo.canDownloadVideo = true;
            

            // Hanya prioritaskan video HD jika tersedia
            if (data.video.no_watermark_hd) {
                contentInfo.videoUrls.push({
                    url: data.video.no_watermark_hd,
                    quality: 'hd',
                    label: 'Video HD'
                });
            }

            // Set cover URL
            if (data.video.cover) {
                contentInfo.coverUrl = data.video.cover;
            }
        }

        // Deteksi audio/musik - IMPROVED DETECTION
        // Cek dari berbagai sumber musik
        if (data.music) {
            contentInfo.hasAudio = true;
            contentInfo.canDownloadAudio = true;
            contentInfo.audioUrls.push({
                url: data.music,
                type: 'music'
            });
            console.log('Audio detected from data.music:', data.music);
        }

        // Fallback: coba deteksi audio dari video object
        if (data.video) {
            // Cek music di dalam video object
            if (data.video.music) {
                contentInfo.hasAudio = true;
                contentInfo.canDownloadAudio = true;
                contentInfo.audioUrls.push({
                    url: data.video.music,
                    type: 'music'
                });
                console.log('Audio detected from data.video.music:', data.video.music);
            }

            // Cek sound_music di dalam video object
            if (data.video.sound_music) {
                contentInfo.hasAudio = true;
                contentInfo.canDownloadAudio = true;
                contentInfo.audioUrls.push({
                    url: data.video.sound_music,
                    type: 'music'
                });
                console.log('Audio detected from data.video.sound_music:', data.video.sound_music);
            }

            // Cek audio_url di dalam video object
            if (data.video.audio_url) {
                contentInfo.hasAudio = true;
                contentInfo.canDownloadAudio = true;
                contentInfo.audioUrls.push({
                    url: data.video.audio_url,
                    type: 'music'
                });
                console.log('Audio detected from data.video.audio_url:', data.video.audio_url);
            }
        }

        // Cek music_url langsung di root data
        if (data.music_url) {
            contentInfo.hasAudio = true;
            contentInfo.canDownloadAudio = true;
            contentInfo.audioUrls.push({
                url: data.music_url,
                type: 'music'
            });
            console.log('Audio detected from data.music_url:', data.music_url);
        }

        // Cek audio_url langsung di root data
        if (data.audio_url) {
            contentInfo.hasAudio = true;
            contentInfo.canDownloadAudio = true;
            contentInfo.audioUrls.push({
                url: data.audio_url,
                type: 'music'
            });
            console.log('Audio detected from data.audio_url:', data.audio_url);
        }

        // Deteksi gambar/foto
        if (data.image) {
            contentInfo.hasImages = true;
            contentInfo.canDownloadImages = true;
            contentInfo.imageUrls.push(data.image);
            console.log('Image detected from data.image:', data.image);
        }
        
        if (data.images && Array.isArray(data.images)) {
            contentInfo.hasImages = true;
            contentInfo.canDownloadImages = true;
            contentInfo.imageUrls.push(...data.images);
            console.log('Images detected from data.images:', data.images);
        }
        
        if (data.photo && Array.isArray(data.photo)) {
            contentInfo.hasImages = true;
            contentInfo.canDownloadImages = true;
            contentInfo.imageUrls.push(...data.photo);
            console.log('Images detected from data.photo:', data.photo);
        }
        
        // Cek single photo
        if (data.photo && !Array.isArray(data.photo)) {
            contentInfo.hasImages = true;
            contentInfo.canDownloadImages = true;
            contentInfo.imageUrls.push(data.photo);
            console.log('Image detected from data.photo:', data.photo);
        }
        
        if (data.cover && !contentInfo.coverUrl) {
            contentInfo.coverUrl = data.cover;
            // Jika tidak ada video tapi ada cover, anggap sebagai gambar
            if (!contentInfo.hasVideo) {
                contentInfo.hasImages = true;
                contentInfo.canDownloadImages = true;
                contentInfo.imageUrls.push(data.cover);
            }
            console.log('Cover URL detected:', data.cover);
        }

        // Cek image_urls array
        if (data.image_urls && Array.isArray(data.image_urls)) {
            contentInfo.hasImages = true;
            contentInfo.canDownloadImages = true;
            contentInfo.imageUrls.push(...data.image_urls);
            console.log('Images detected from data.image_urls:', data.image_urls);
        }

        // Tentukan tipe konten utama berdasarkan prioritas
        if (contentInfo.hasVideo && contentInfo.type === 'unknown') {
            contentInfo.type = 'video';
        } else if (contentInfo.hasImages && contentInfo.type === 'unknown') {
            contentInfo.type = 'image';
        } else if (contentInfo.hasAudio && contentInfo.type === 'unknown') {
            contentInfo.type = 'audio';
        }

        // Jika masih unknown, coba deteksi dari URL atau struktur data
        if (contentInfo.type === 'unknown') {
            if (contentInfo.videoUrls.length > 0) {
                contentInfo.type = 'video';
            } else if (contentInfo.imageUrls.length > 0) {
                contentInfo.type = 'image';
            } else if (contentInfo.audioUrls.length > 0) {
                contentInfo.type = 'audio';
            } else {
                contentInfo.type = 'unknown';
            }
        }

        console.log('Final content detection result:', contentInfo);
        return contentInfo;

    } catch (error) {
        console.error('Error detecting content type:', error);
        return contentInfo;
    }
}

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


// Perbarui fungsi displayResult untuk menggunakan deteksi otomatis konten
async function displayResult(data) {
    // Deteksi konten menggunakan function baru
    const contentInfo = detectContentType(data);
    let html = '';


    // Handle video content
    if (contentInfo.type === 'video' || contentInfo.hasVideo) {
        // Deteksi rasio aspek video
        let ratioClass = 'portrait'; // default
        let detectedWidth = 1080;
        let detectedHeight = 1920;

        // Gunakan URL video pertama yang tersedia
        const primaryVideoUrl = contentInfo.videoUrls.find(v => v.quality === 'hd')?.url || 
                               contentInfo.videoUrls.find(v => v.quality === 'standard')?.url || '';

        try {
            if (primaryVideoUrl) {
                const videoInfo = await detectVideoAspectRatio(primaryVideoUrl);
                ratioClass = videoInfo.ratioClass;
                detectedWidth = videoInfo.width;
                detectedHeight = videoInfo.height;

                console.log(`Video detected: ${detectedWidth}x${detectedHeight}, ratio: ${videoInfo.aspectRatio}, class: ${ratioClass}`);
            }
        } catch (error) {
            console.log('Gagal mendeteksi rasio aspek video:', error);
        }

        // Gunakan poster dari contentInfo
        const posterUrl = contentInfo.coverUrl || data.video?.cover || '';

        html = `
        <div class="download-card">
            <h3 class="text-center mb-4"><i class="fas fa-check-circle text-success"></i> Video Siap Diunduh!</h3>
            
            <div class="media-preview">
                <div class="video-player-container ${ratioClass}">
                    <video class="video-player" id="video-player" poster="${posterUrl}">
                        <source src="${primaryVideoUrl}" type="video/mp4">
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
                    ${data.video?.title || data.title ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-heading"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Judul</span>
                            <span class="font-semibold">${data.video?.title || data.title || 'Tidak tersedia'}</span>
                        </div>
                    </div>
                    ` : ''}
                    ${data.video?.author || data.author ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Pembuat Konten</span>
                            <span class="font-semibold">${data.video?.author || data.author || 'Tidak tersedia'}</span>
                        </div>
                    </div>
                    ` : ''}
                    ${data.video?.region || data.region ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Region</span>
                            <span class="font-semibold">${data.video?.region || data.region || 'Tidak tersedia'}</span>
                        </div>
                    </div>
                    ` : ''}
                    ${data.creator ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Creator Endpoint</span>
                            <span class="font-semibold">${data.creator}</span>
                        </div>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-expand"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Resolusi</span>
                            <span class="font-semibold">${detectedWidth} × ${detectedHeight} (${ratioClass})</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Konten Tersedia</span>
                            <span class="font-semibold">
                                Video ${contentInfo.canDownloadAudio ? ', Audio' : ''} ${contentInfo.canDownloadImages ? ', Gambar' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <h4 class="mt-6 mb-3"><i class="fas fa-download text-primary"></i> Pilihan Download</h4>
            <div class="download-progress" id="download-progress">
                <div class="download-progress-bar" id="download-progress-bar"></div>
            </div>

            <div class="download-options">
                ${contentInfo.canDownloadVideo ? contentInfo.videoUrls.map(video => `
                    <button onclick="downloadFile('${video.url}', 'tiksave_content${data.video?.id || Date.now()}_${video.quality}', 'video')" class="btn btn-primary" data-type="video">
                        <span class="btn-text"><i class="fas fa-${video.quality === 'hd' ? 'hd' : 'video'}"></i> ${video.label}</span>
                    </button>
                `).join('') : ''}
                
                ${contentInfo.canDownloadAudio ? contentInfo.audioUrls.map(audio => `
                    <button onclick="downloadFile('${audio.url}', 'tiksave_content${data.video?.id || Date.now()}_music', 'audio')" class="btn btn-secondary" data-type="audio">
                        <span class="btn-text"><i class="fas fa-music"></i> Download Musik</span>
                    </button>
                `).join('') : ''}
                
                ${contentInfo.canDownloadImages ? contentInfo.imageUrls.slice(0, 3).map((image, index) => `
                    <button onclick="downloadFile('${image}', 'tiksave_content${data.video?.id || Date.now()}_image${index + 1}', 'image')" class="btn btn-outline" data-type="image">
                        <span class="btn-text"><i class="fas fa-image"></i> Gambar ${index + 1}</span>
                    </button>
                `).join('') : ''}
            </div>
            
            <div class="mt-4 text-center">
                <button class="btn btn-sm" onclick="resetForm()">
                    <i class="fas fa-redo"></i> Download Video Lain
                </button>
            </div>
        </div>
        `;
    } else if (contentInfo.type === 'image') {
        // Handle image content
        html = `
        <div class="download-card">
            <h3 class="text-center mb-4"><i class="fas fa-check-circle text-success"></i> Foto Siap Diunduh!</h3>
            
            <div class="media-preview">
                <div class="image-container">
                    <img src="${contentInfo.imageUrls[0] || contentInfo.coverUrl}" 
                         alt="Preview" 
                         class="video-player"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/500x500?text=Image+Not+Available'">
                </div>
                
                <div class="media-info">
                    <h4 class="mb-3"><i class="fas fa-info-circle text-primary"></i> Informasi Foto</h4>
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
                    ${data.creator ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Creator Endpoint</span>
                            <span class="font-semibold">${data.creator}</span>
                        </div>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Konten Tersedia</span>
                            <span class="font-semibold">
                                Foto ${contentInfo.canDownloadAudio ? ', Audio' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <h4 class="mt-6 mb-3"><i class="fas fa-download text-primary"></i> Pilihan Download</h4>
            <div class="download-options">
                ${contentInfo.canDownloadImages ? contentInfo.imageUrls.map((image, index) => `
                    <button onclick="downloadFile('${image}', 'tiksave_content${Date.now()}_image${index + 1}', 'image')" class="btn btn-primary" data-type="image">
                        <span class="btn-text"><i class="fas fa-image"></i> Download Foto ${index + 1}</span>
                    </button>
                `).join('') : ''}
                
                ${contentInfo.canDownloadAudio ? contentInfo.audioUrls.map(audio => `
                    <button onclick="downloadFile('${audio.url}', 'tiksave_content${Date.now()}_music', 'audio')" class="btn btn-secondary" data-type="audio">
                        <span class="btn-text"><i class="fas fa-music"></i> Download Musik</span>
                    </button>
                `).join('') : ''}
            </div>
            
            <div class="mt-4 text-center">
                <button class="btn btn-sm" onclick="resetForm()">
                    <i class="fas fa-redo"></i> Download Foto Lain
                </button>
            </div>
        </div>
        `;
    } else if (contentInfo.type === 'audio') {
        // Handle audio content
        html = `
        <div class="download-card">
            <h3 class="text-center mb-4"><i class="fas fa-check-circle text-success"></i> Audio Siap Diunduh!</h3>
            
            <div class="media-preview">
                <div class="image-container d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #ff0050, #ff3377); min-height: 300px;">
                    <div class="text-center text-white">
                        <i class="fas fa-music fa-5x mb-4"></i>
                        <h4>Audio TikTok</h4>
                        <p>${data.title || 'Audio Content'}</p>
                    </div>
                </div>
                
                <div class="media-info">
                    <h4 class="mb-3"><i class="fas fa-info-circle text-primary"></i> Informasi Audio</h4>
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
                    ${data.creator ? `
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Creator Endpoint</span>
                            <span class="font-semibold">${data.creator}</span>
                        </div>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Format</span>
                            <span class="font-semibold">MP3 Audio</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <h4 class="mt-6 mb-3"><i class="fas fa-download text-primary"></i> Download Audio</h4>
            <div class="download-options">
                ${contentInfo.canDownloadAudio ? contentInfo.audioUrls.map(audio => `
                    <button onclick="downloadFile('${audio.url}', 'tiksave_content${Date.now()}_music', 'audio')" class="btn btn-secondary btn-lg" data-type="audio">
                        <span class="btn-text"><i class="fas fa-music"></i> Download Musik MP3</span>
                    </button>
                `).join('') : '<p class="text-gray text-center">Tidak ada audio yang dapat diunduh</p>'}
            </div>
            
            <div class="mt-4 text-center">
                <button class="btn btn-sm" onclick="resetForm()">
                    <i class="fas fa-redo"></i> Download Audio Lain
                </button>
            </div>
        </div>
        `;
    } else {
        // Handle unknown content type
        html = `
        <div class="download-card">
            <h3 class="text-center mb-4"><i class="fas fa-check-circle text-success"></i> Konten Siap Diunduh!</h3>
            
            <div class="media-preview">
                <div class="video-player-container d-flex align-items-center justify-content-center" style="background: #f0f0f0; min-height: 300px;">
                    <div class="text-center">
                        <i class="fas fa-download fa-5x mb-4 text-gray"></i>
                        <h4 class="text-gray">Konten Tidak Dikenal</h4>
                        <p class="text-gray">Tipe konten: ${contentInfo.type}</p>
                        <p class="text-sm text-gray">Silakan coba download jika tersedia</p>
                    </div>
                </div>
                
                <div class="media-info">
                    <h4 class="mb-3"><i class="fas fa-info-circle text-primary"></i> Informasi Konten</h4>
                    <div class="info-item">
                        <div class="info-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        <div class="info-content">
                            <span class="text-sm text-gray">Konten Tersedia</span>
                            <span class="font-semibold">
                                ${contentInfo.canDownloadVideo ? 'Video' : ''}
                                ${contentInfo.canDownloadAudio ? (contentInfo.canDownloadVideo ? ', ' : '') + 'Audio' : ''}
                                ${contentInfo.canDownloadImages ? (contentInfo.canDownloadVideo || contentInfo.canDownloadAudio ? ', ' : '') + 'Gambar' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <h4 class="mt-6 mb-3"><i class="fas fa-download text-primary"></i> Download Tersedia</h4>
            <div class="download-options">
                ${contentInfo.canDownloadVideo ? contentInfo.videoUrls.map(video => `
                    <button onclick="downloadFile('${video.url}', 'tiksave_content${Date.now()}_${video.quality}', 'video')" class="btn btn-primary" data-type="video">
                        <span class="btn-text"><i class="fas fa-video"></i> ${video.label}</span>
                    </button>
                `).join('') : ''}
                
                ${contentInfo.canDownloadAudio ? contentInfo.audioUrls.map(audio => `
                    <button onclick="downloadFile('${audio.url}', 'tiksave_content${Date.now()}_music', 'audio')" class="btn btn-secondary" data-type="audio">
                        <span class="btn-text"><i class="fas fa-music"></i> Download Musik</span>
                    </button>
                `).join('') : ''}
                
                ${contentInfo.canDownloadImages ? contentInfo.imageUrls.slice(0, 3).map((image, index) => `
                    <button onclick="downloadFile('${image}', 'tiksave_content${Date.now()}_image${index + 1}', 'image')" class="btn btn-outline" data-type="image">
                        <span class="btn-text"><i class="fas fa-image"></i> Gambar ${index + 1}</span>
                    </button>
                `).join('') : ''}
                
                ${(!contentInfo.canDownloadVideo && !contentInfo.canDownloadAudio && !contentInfo.canDownloadImages) ? 
                    '<p class="text-gray text-center">Tidak ada konten yang dapat diunduh</p>' : ''}
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


// Mobile menu toggle removed - now handled by SidebarManager class

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


// Update statistics every 30 seconds when on statistics page - MOVED TO SIDEBARMANAGER
