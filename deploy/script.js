// 간단하고 안정적인 QR 코드 생성기
// QR Server API를 사용한 실제 작동하는 버전

console.log('🚀 QR Generator script loading...');

class QRGenerator {
    constructor() {
        console.log('📦 QRGenerator constructor called');
        this.debugMode = true;
        this.init();
    }

    log(message, ...args) {
        if (this.debugMode) {
            console.log(`[QRGen] ${message}`, ...args);
        }
    }

    error(message, ...args) {
        console.error(`[QRGen ERROR] ${message}`, ...args);
    }

    init() {
        this.log('🔧 Initializing QRGenerator');
        this.setupTabSwitching();
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.showNotification('QR 코드 생성기가 준비되었습니다', 'success');
    }

    setupTabSwitching() {
        this.log('🔄 Setting up tab switching');
        
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        this.log('Found tab buttons:', tabButtons.length);
        this.log('Found tab panels:', tabPanels.length);

        tabButtons.forEach((button, index) => {
            this.log(`Setting up button ${index}:`, button.getAttribute('data-tab'));
            
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.log(`🖱️ Tab clicked: ${targetTab}`);
                
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-tab`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    this.log(`✅ Switched to tab: ${targetTab}`);
                } else {
                    this.error(`❌ Target panel not found: ${targetTab}-tab`);
                }
            });
        });
    }

    setupEventListeners() {
        this.log('🎯 Setting up event listeners');

        // URL Generate button
        const urlBtn = document.getElementById('url-generate-btn');
        if (urlBtn) {
            this.log('✅ URL generate button found');
            urlBtn.addEventListener('click', () => {
                this.log('🖱️ URL generate button clicked');
                this.generateUrlQR();
            });
        } else {
            this.error('❌ URL generate button NOT found');
        }

        // WiFi Generate button
        const wifiBtn = document.getElementById('wifi-generate-btn');
        if (wifiBtn) {
            this.log('✅ WiFi generate button found');
            wifiBtn.addEventListener('click', () => {
                this.log('🖱️ WiFi generate button clicked');
                this.generateWifiQR();
            });
        } else {
            this.error('❌ WiFi generate button NOT found');
        }

        // Download buttons
        const urlDownloadBtn = document.getElementById('url-download-btn');
        const wifiDownloadBtn = document.getElementById('wifi-download-btn');
        
        if (urlDownloadBtn) {
            urlDownloadBtn.addEventListener('click', () => this.downloadQR('url'));
        }
        if (wifiDownloadBtn) {
            wifiDownloadBtn.addEventListener('click', () => this.downloadQR('wifi'));
        }

        // Enter key support for URL input
        const urlInput = document.getElementById('url-input');
        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.log('⌨️ Enter key pressed in URL input');
                    this.generateUrlQR();
                }
            });
        }
    }

    setupPasswordToggle() {
        this.log('👁️ Setting up password toggle');
        
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('wifi-password');
        
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                passwordToggle.innerHTML = isPassword ? 
                    '<i class="fas fa-eye-slash"></i>' : 
                    '<i class="fas fa-eye"></i>';
                this.log(`👁️ Password visibility toggled: ${!isPassword ? 'visible' : 'hidden'}`);
            });
        }
    }

    async generateUrlQR() {
        this.log('🎯 generateUrlQR called');
        
        const input = document.getElementById('url-input');
        const generateBtn = document.getElementById('url-generate-btn');
        const validation = document.getElementById('url-validation');
        
        if (!input) {
            this.error('❌ URL input element not found');
            return;
        }
        
        const text = input.value.trim();
        this.log('📝 Text to generate QR for:', text);
        
        // Clear previous validation
        if (validation) {
            validation.className = 'input-validation';
            validation.textContent = '';
        }

        if (!text) {
            this.log('⚠️ Empty text provided');
            this.showValidationError('url-validation', 'URL 또는 텍스트를 입력해 주세요');
            input.focus();
            return;
        }

        // Validate URL if it looks like a URL
        if (this.looksLikeUrl(text) && !this.isValidUrl(text)) {
            this.log('⚠️ Invalid URL provided:', text);
            this.showValidationError('url-validation', '올바른 URL을 입력해 주세요');
            return;
        }

        // Show loading state
        this.setButtonLoading(generateBtn, true);

        try {
            this.log('🔄 Starting QR generation for URL');
            await this.generateQRCode('url', text);
            this.log('✅ URL QR generation successful');
            this.showValidationSuccess('url-validation', 'QR 코드가 성공적으로 생성되었습니다');
            this.showNotification('QR 코드가 생성되었습니다', 'success');
        } catch (error) {
            this.error('❌ URL QR generation failed:', error);
            this.showValidationError('url-validation', 'QR 코드 생성 중 오류가 발생했습니다');
            this.showNotification('QR 코드 생성 실패', 'error');
        } finally {
            this.setButtonLoading(generateBtn, false);
        }
    }

    async generateWifiQR() {
        this.log('🎯 generateWifiQR called');
        
        const ssidInput = document.getElementById('wifi-ssid');
        const passwordInput = document.getElementById('wifi-password');
        const generateBtn = document.getElementById('wifi-generate-btn');

        if (!ssidInput) {
            this.error('❌ WiFi SSID input not found');
            return;
        }

        const ssid = ssidInput.value.trim();
        const password = passwordInput?.value || '';
        const security = 'WPA'; // 기본값: WPA/WPA2 (가장 일반적)
        const hidden = false; // 기본값: 숨겨지지 않은 네트워크

        this.log('📡 WiFi parameters:', { ssid, password: password ? '[HIDDEN]' : '', security, hidden });

        if (!ssid) {
            this.log('⚠️ Empty SSID provided');
            this.showNotification('네트워크 이름(SSID)을 입력해 주세요', 'error');
            ssidInput.focus();
            return;
        }

        // Show loading state
        this.setButtonLoading(generateBtn, true, 'WiFi QR 코드 생성');

        try {
            // Create WiFi QR string
            const wifiString = `WIFI:T:${security};S:${this.escapeWifiString(ssid)};P:${this.escapeWifiString(password)};H:${hidden ? 'true' : 'false'};;`;
            this.log('📡 WiFi QR string:', wifiString);
            
            this.log('🔄 Starting QR generation for WiFi');
            await this.generateQRCode('wifi', wifiString);
            this.log('✅ WiFi QR generation successful');
            this.showNotification('WiFi QR 코드가 성공적으로 생성되었습니다', 'success');
        } catch (error) {
            this.error('❌ WiFi QR generation failed:', error);
            this.showNotification('WiFi QR 코드 생성 중 오류가 발생했습니다', 'error');
        } finally {
            this.setButtonLoading(generateBtn, false, 'WiFi QR 코드 생성');
        }
    }

    generateQRCode(type, text) {
        this.log(`🔄 generateQRCode called for type: ${type}, text: ${text.substring(0, 50)}...`);
        
        return new Promise((resolve, reject) => {
            const canvas = document.getElementById(`${type}-qr-canvas`);
            const placeholder = document.getElementById(`${type}-qr-placeholder`);
            const downloadBtn = document.getElementById(`${type}-download-btn`);
            const container = document.getElementById(`${type}-qr-container`);

            if (!canvas) {
                this.error(`❌ Canvas element not found: ${type}-qr-canvas`);
                reject(new Error('Canvas element not found'));
                return;
            }

            // Use QR Server API (simple and reliable)
            this.log('🌐 Using QR Server API');
            const size = 260;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
            
            // Create an image element to load the QR code
            const img = new Image();
            // Try with CORS first, fallback without if needed
            img.crossOrigin = 'anonymous';
            
            // Set timeout for loading
            const timeout = setTimeout(() => {
                this.log('⏰ QR Server API timeout');
                reject(new Error('QR generation timeout'));
            }, 10000);
            
            img.onload = () => {
                clearTimeout(timeout);
                this.log('✅ QR Server API loaded successfully');
                
                try {
                    // Draw the image onto the canvas
                    const ctx = canvas.getContext('2d');
                    canvas.width = size;
                    canvas.height = size;
                    ctx.clearRect(0, 0, size, size);
                    ctx.drawImage(img, 0, 0, size, size);
                    
                    this.showQRCode(type, canvas, placeholder, downloadBtn, container);
                    resolve();
                } catch (error) {
                    this.error('❌ Error drawing QR to canvas:', error);
                    reject(error);
                }
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                this.log('❌ QR Server API failed, trying fallback method...');
                
                // Fallback: Use img element directly instead of canvas
                this.showQRCodeAsImage(type, qrUrl, placeholder, downloadBtn, container);
                resolve();
            };
            
            this.log('🌐 Loading from QR Server API:', qrUrl);
            img.src = qrUrl;
        });
    }

    showQRCode(type, canvas, placeholder, downloadBtn, container) {
        this.log(`📱 Showing QR code for type: ${type}`);
        
        if (placeholder) placeholder.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (container) container.classList.add('has-qr');
        
        // QR 생성 후 광고 표시
        this.showResultAd(type);
    }

    showQRCodeAsImage(type, qrUrl, placeholder, downloadBtn, container) {
        this.log(`📱 Showing QR code as image for type: ${type}`);
        
        // Create img element as fallback
        const img = document.createElement('img');
        img.src = qrUrl;
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            width: 260px;
            height: 260px;
        `;
        img.alt = 'QR Code';
        
        // Replace placeholder with image
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Add image to container
        if (container) {
            container.appendChild(img);
            container.classList.add('has-qr');
        }
        
        // Show download button (but it won't work without canvas)
        if (downloadBtn) {
            downloadBtn.style.display = 'flex';
            // Modify download function for image fallback
            downloadBtn.onclick = () => {
                this.log('📥 Download attempted with image fallback');
                this.showNotification('이미지를 우클릭하여 저장해주세요', 'info');
            };
        }
        
        // QR 생성 후 광고 표시
        this.showResultAd(type);
    }

    showResultAd(type) {
        this.log(`💰 Showing result ad for type: ${type}`);
        
        const adContainer = document.getElementById(`${type}-ad-result`);
        if (adContainer) {
            // 약간의 지연 후 광고 표시 (사용자 경험 고려)
            setTimeout(() => {
                adContainer.style.display = 'block';
                adContainer.style.animation = 'fadeIn 0.5s ease-out';
                this.log(`💰 Result ad displayed for ${type}`);
            }, 1000);
        }
    }

    downloadQR(type) {
        this.log(`💾 Download QR requested for type: ${type}`);
        
        const canvas = document.getElementById(`${type}-qr-canvas`);
        const downloadBtn = document.getElementById(`${type}-download-btn`);
        
        if (!canvas || canvas.style.display === 'none') {
            this.log('⚠️ No QR code to download');
            this.showNotification('다운로드할 QR 코드가 없습니다', 'error');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `${type === 'url' ? 'url' : 'wifi'}-qr-code.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Visual feedback
            if (downloadBtn) {
                const originalHTML = downloadBtn.innerHTML;
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> 다운로드 완료!';
                downloadBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
                
                setTimeout(() => {
                    downloadBtn.innerHTML = originalHTML;
                    downloadBtn.style.background = '';
                }, 2000);
            }
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.log('✅ QR code downloaded successfully');
            this.showNotification('QR 코드가 다운로드되었습니다', 'success');
        } catch (error) {
            this.error('❌ Download failed:', error);
            this.showNotification('다운로드 실패', 'error');
        }
    }

    // Utility functions
    looksLikeUrl(text) {
        return /^https?:\/\/|^www\.|^\w+\.\w+/.test(text.toLowerCase());
    }

    isValidUrl(text) {
        try {
            let url = text;
            if (!text.startsWith('http://') && !text.startsWith('https://')) {
                url = 'https://' + text;
            }
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    escapeWifiString(str) {
        return str.replace(/([\\";,:])/g, '\\$1');
    }

    setButtonLoading(button, loading, originalText = 'QR 코드 생성') {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
            this.log('🔄 Button set to loading state');
        } else {
            button.disabled = false;
            const icon = button.id.includes('wifi') ? 'fas fa-wifi' : 'fas fa-qrcode';
            button.innerHTML = `<i class="${icon}"></i> ${originalText}`;
            this.log('✅ Button loading state cleared');
        }
    }

    showValidationError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = 'input-validation error';
            element.textContent = message;
        }
    }

    showValidationSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = 'input-validation success';
            element.textContent = message;
        }
    }

    showNotification(message, type = 'info') {
        this.log(`📢 Notification: ${type} - ${message}`);
        
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const colors = {
            success: '#11998e',
            error: '#e74c3c',
            warn: '#f39c12',
            info: '#3498db'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            font-family: var(--font-primary, Arial, sans-serif);
            font-size: 0.9rem;
            font-weight: 500;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
        notification.innerHTML = `${icon} ${message}`;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize application
function initApp() {
    console.log('🚀 Initializing QR Generator App');
    
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        console.log('⏳ DOM still loading, waiting...');
        document.addEventListener('DOMContentLoaded', initApp);
        return;
    }
    
    console.log('✅ DOM is ready');
    
    try {
        window.qrGenerator = new QRGenerator();
        console.log('✅ QR Generator initialized successfully');
        
        // Add loaded class for animations
        setTimeout(() => {
            document.body.classList.add('loaded');
            console.log('✅ Loaded class added to body');
        }, 100);
        
    } catch (error) {
        console.error('❌ Failed to initialize QR Generator:', error);
        
        // Show error notification
        alert('QR 코드 생성기 초기화에 실패했습니다. 페이지를 새로고침해 주세요.');
    }
}

// Start the application
console.log('📝 Script loaded, starting initialization...');
initApp();

// Global error handling
window.addEventListener('error', (e) => {
    console.error('🚨 Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled promise rejection:', e.reason);
});

console.log('✅ QR Generator script setup complete');