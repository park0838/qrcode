// QR Code Generator with Comprehensive Debugging

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
        this.testLibraryAvailability();
    }

    testLibraryAvailability() {
        this.log('🧪 Testing QRCode library availability');
        
        // Wait a bit for the library to load, then check multiple times
        const checkLibrary = (attempt = 1) => {
            if (typeof QRCode !== 'undefined') {
                this.log('✅ QRCode library is available');
                this.log('QRCode type:', typeof QRCode);
                this.log('QRCode.toCanvas type:', typeof QRCode.toCanvas);
                
                // Test basic generation
                this.testBasicGeneration();
                this.showNotification('QRCode 라이브러리 로드 성공', 'success');
            } else if (attempt < 10) {
                this.log(`⏳ QRCode library not ready yet, checking again (attempt ${attempt})...`);
                setTimeout(() => checkLibrary(attempt + 1), 500);
            } else {
                this.error('❌ QRCode library is NOT available after 10 attempts');
                this.showNotification('Google Charts API 사용 중', 'info');
            }
        };
        
        checkLibrary();
    }

    testBasicGeneration() {
        this.log('🧪 Testing basic QR generation');
        
        // Create a temporary canvas for testing
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 100;
        testCanvas.height = 100;
        
        QRCode.toCanvas(testCanvas, 'Test', { width: 100 }, (error) => {
            if (error) {
                this.error('❌ Basic QR generation test failed:', error);
            } else {
                this.log('✅ Basic QR generation test passed');
            }
        });
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

        // Enter key support
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
        const securitySelect = document.getElementById('wifi-security');
        const hiddenCheckbox = document.getElementById('wifi-hidden');
        const generateBtn = document.getElementById('wifi-generate-btn');

        if (!ssidInput) {
            this.error('❌ WiFi SSID input not found');
            return;
        }

        const ssid = ssidInput.value.trim();
        const password = passwordInput?.value || '';
        const security = securitySelect?.value || 'WPA';
        const hidden = hiddenCheckbox?.checked || false;

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

            // Primary Method: Use Google Charts (more reliable)
            this.log('🌐 Using Google Charts API (primary method)');
            this.generateWithGoogleCharts(type, text, resolve, reject, () => {
                // Fallback to qrcode.js if Google Charts fails
                if (typeof QRCode !== 'undefined') {
                    this.log('🔧 Falling back to qrcode.js library');
                    
                    QRCode.toCanvas(canvas, text, {
                        width: 260,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        },
                        errorCorrectionLevel: 'M'
                    }, (error) => {
                        if (error) {
                            this.error('❌ Both methods failed:', error);
                            reject(new Error('Both QR generation methods failed'));
                        } else {
                            this.log('✅ qrcode.js fallback successful');
                            this.showQRCode(type, canvas, placeholder, downloadBtn, container);
                            resolve();
                        }
                    });
                } else {
                    this.error('❌ Both methods failed - no QRCode library available');
                    reject(new Error('Both QR generation methods failed'));
                }
            });
        });
    }

    generateWithGoogleCharts(type, text, resolve, reject, fallbackCallback = null) {
        this.log('🌐 Using Google Charts API');
        
        const canvas = document.getElementById(`${type}-qr-canvas`);
        const placeholder = document.getElementById(`${type}-qr-placeholder`);
        const downloadBtn = document.getElementById(`${type}-download-btn`);
        const container = document.getElementById(`${type}-qr-container`);
        
        // Create an image element to load from Google Charts
        const img = new Image();
        const encodedText = encodeURIComponent(text);
        const size = '260x260';
        const url = `https://chart.googleapis.com/chart?chs=${size}&cht=qr&chl=${encodedText}`;
        
        // Set timeout for loading
        const timeout = setTimeout(() => {
            this.log('⏰ Google Charts timeout, trying fallback...');
            if (fallbackCallback) {
                fallbackCallback();
            } else {
                reject(new Error('Google Charts API timeout'));
            }
        }, 5000);
        
        img.onload = () => {
            clearTimeout(timeout);
            this.log('✅ Google Charts QR loaded successfully');
            
            try {
                // Draw the image onto the canvas
                const ctx = canvas.getContext('2d');
                canvas.width = 260;
                canvas.height = 260;
                ctx.clearRect(0, 0, 260, 260);
                ctx.drawImage(img, 0, 0, 260, 260);
                
                this.showQRCode(type, canvas, placeholder, downloadBtn, container);
                resolve();
            } catch (error) {
                this.error('❌ Error drawing Google Charts QR:', error);
                if (fallbackCallback) {
                    fallbackCallback();
                } else {
                    reject(error);
                }
            }
        };
        
        img.onerror = () => {
            clearTimeout(timeout);
            this.log('❌ Google Charts API failed, trying fallback...');
            if (fallbackCallback) {
                fallbackCallback();
            } else {
                reject(new Error('Google Charts API failed'));
            }
        };
        
        this.log('🌐 Loading from Google Charts:', url);
        img.src = url;
    }

    showQRCode(type, canvas, placeholder, downloadBtn, container) {
        this.log(`📱 Showing QR code for type: ${type}`);
        
        if (placeholder) placeholder.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (container) container.classList.add('has-qr');
    }

    downloadQR(type) {
        this.log(`💾 Download QR requested for type: ${type}`);
        
        const canvas = document.getElementById(`${type}-qr-canvas`);
        const downloadBtn = document.getElementById(`${type}-download-btn`);
        
        if (!canvas || canvas.style.display === 'none') {
            this.log('⚠️ No QR code to download');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `${type === 'url' ? 'url' : 'wifi'}-qr-code.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Visual feedback
            const originalHTML = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fas fa-check"></i> 다운로드 완료!';
            downloadBtn.style.background = 'var(--success-gradient)';
            
            setTimeout(() => {
                downloadBtn.innerHTML = originalHTML;
                downloadBtn.style.background = '';
            }, 2000);
            
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
            button.innerHTML = '<div class="loading"></div> 생성 중...';
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
            animation: slideInRight 0.3s ease-out;
        `;

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
        notification.innerHTML = `${icon} ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);

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