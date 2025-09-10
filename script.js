// Simple and reliable QR code generator
// Working version using QR Server API

class QRGenerator {
    constructor() {
        this.debugMode = false; // Set to false for production
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
        this.setupTabSwitching();
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.showNotification('QR Generator ready to use', 'success');
    }

    setupTabSwitching() {
        
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');


        tabButtons.forEach((button, index) => {
            
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const targetPanel = document.getElementById(`${targetTab}-tab`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                } else {
                    this.error(`Target panel not found: ${targetTab}-tab`);
                }
            });
        });
    }

    setupEventListeners() {
        // Add generateQR method for HTML onclick compatibility
        window.qrGenerator.generateQR = (type) => {
            if (type === 'url') {
                this.generateUrlQR();
            } else if (type === 'wifi') {
                this.generateWifiQR();
            }
        };

        // Enter key support for URL input
        const urlInput = document.getElementById('url-input');
        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.generateUrlQR();
                }
            });
        }
    }

    setupPasswordToggle() {
        
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('wifi-password');
        
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                passwordToggle.innerHTML = isPassword ? 
                    '<i class="fas fa-eye-slash"></i>' : 
                    '<i class="fas fa-eye"></i>';
            });
        }
    }

    async generateUrlQR() {
        
        const input = document.getElementById('url-input');
        const generateBtn = document.getElementById('url-generate-btn');
        const validation = document.getElementById('url-validation');
        
        if (!input) {
            this.error('URL input element not found');
            return;
        }
        
        const text = input.value.trim();
        
        // Clear previous validation
        if (validation) {
            validation.className = 'input-validation';
            validation.textContent = '';
        }

        if (!text) {
            this.showValidationError('url-validation', 'Please enter URL or text');
            input.focus();
            return;
        }

        // Validate URL if it looks like a URL
        if (this.looksLikeUrl(text) && !this.isValidUrl(text)) {
            this.showValidationError('url-validation', 'Please enter a valid URL');
            return;
        }

        // Show loading state
        this.setButtonLoading(generateBtn, true);

        try {
            await this.generateQRCode('url', text);
            this.showValidationSuccess('url-validation', 'QR code generated successfully');
            this.showNotification('QR code generated successfully', 'success');
        } catch (error) {
            this.error('URL QR generation failed:', error);
            this.showValidationError('url-validation', 'Error occurred during QR code generation');
            this.showNotification('QR code generation failed', 'error');
        } finally {
            this.setButtonLoading(generateBtn, false);
        }
    }

    async generateWifiQR() {
        
        const ssidInput = document.getElementById('wifi-ssid');
        const passwordInput = document.getElementById('wifi-password');
        const generateBtn = document.getElementById('wifi-generate-btn');

        if (!ssidInput) {
            this.error('WiFi SSID input not found');
            return;
        }

        const ssid = ssidInput.value.trim();
        const password = passwordInput?.value || '';
        const security = 'WPA'; // Default: WPA/WPA2 (most common)
        const hidden = false; // Default: visible network


        if (!ssid) {
            this.showNotification('Please enter network name (SSID)', 'error');
            ssidInput.focus();
            return;
        }

        // Show loading state
        this.setButtonLoading(generateBtn, true, 'Generate WiFi QR');

        try {
            // Create WiFi QR string
            const wifiString = `WIFI:T:${security};S:${this.escapeWifiString(ssid)};P:${this.escapeWifiString(password)};H:${hidden ? 'true' : 'false'};;`;
            await this.generateQRCode('wifi', wifiString);
            this.showNotification('WiFi QR code generated successfully', 'success');
        } catch (error) {
            this.error('WiFi QR generation failed:', error);
            this.showNotification('WiFi QR code generation failed', 'error');
        } finally {
            this.setButtonLoading(generateBtn, false, 'Generate WiFi QR');
        }
    }

    generateQRCode(type, text) {
        
        return new Promise((resolve, reject) => {
            const canvas = document.getElementById(`${type}-qr-canvas`);
            const placeholder = document.getElementById(`${type}-qr-placeholder`);
            const downloadBtn = document.getElementById(`${type}-download-btn`);
            const container = document.getElementById(`${type}-qr-container`);

            if (!canvas) {
                this.error(`Canvas element not found: ${type}-qr-canvas`);
                reject(new Error('Canvas element not found'));
                return;
            }

            // Use QR Server API (simple and reliable)
            const size = 260;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
            
            // Create an image element to load the QR code
            const img = new Image();
            // Try with CORS first, fallback without if needed
            img.crossOrigin = 'anonymous';
            
            // Set timeout for loading
            const timeout = setTimeout(() => {
                reject(new Error('QR generation timeout'));
            }, 10000);
            
            img.onload = () => {
                clearTimeout(timeout);
                
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
                    this.error('Error drawing QR to canvas:', error);
                    reject(error);
                }
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                
                // Fallback: Use img element directly instead of canvas
                this.showQRCodeAsImage(type, qrUrl, placeholder, downloadBtn, container);
                resolve();
            };
            
            img.src = qrUrl;
        });
    }

    showQRCode(type, canvas, placeholder, downloadBtn, container) {
        
        if (placeholder) placeholder.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (container) container.classList.add('has-qr');
        
    }

    showQRCodeAsImage(type, qrUrl, placeholder, downloadBtn, container) {
        
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
                this.showNotification('Right-click the image to save', 'info');
            };
        }
        
    }


    downloadQR(type) {
        
        const canvas = document.getElementById(`${type}-qr-canvas`);
        const downloadBtn = document.getElementById(`${type}-download-btn`);
        
        if (!canvas || canvas.style.display === 'none') {
            this.showNotification('No QR code to download', 'error');
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
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Download Complete!';
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
            
            this.showNotification('QR code downloaded successfully', 'success');
        } catch (error) {
            this.error('Download failed:', error);
            this.showNotification('Download failed', 'error');
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

    setButtonLoading(button, loading, originalText = 'Generate QR Code') {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        } else {
            button.disabled = false;
            const icon = button.id.includes('wifi') ? 'fas fa-wifi' : 'fas fa-qrcode';
            button.innerHTML = `<i class="${icon}"></i> ${originalText}`;
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
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
        return;
    }
    
    try {
        window.qrGenerator = new QRGenerator();
        
        // Add loaded class for animations
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
        
    } catch (error) {
        console.error('Failed to initialize QR Generator:', error);
        alert('Failed to initialize QR Generator. Please refresh the page.');
    }
}

// Start the application
initApp();

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});