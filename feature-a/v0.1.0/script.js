// App content data
const appContent = {
    myqr: {
        title: '🔳 QR Code Generator',
        content: `
            <div style="text-align: center;">
                <input type="text" id="qrText" placeholder="Enter text or URL" 
                    style="width: 100%; max-width: 400px; padding: 15px 20px; margin: 10px 0; 
                    border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px;" />
                <br>
                <button onclick="generateQR()" 
                    style="padding: 15px 30px; font-size: 16px; background: #10b981; 
                    color: white; border: none; border-radius: 8px; cursor: pointer; margin: 10px 5px; 
                    min-width: 120px; font-weight: 600;">
                    Generate QR Code
                </button>
                <div id="qrcode" style="margin: 30px auto; display: flex; justify-content: center; align-items: center;
                    min-height: 280px; background: #f8f9fa; border-radius: 12px; border: 2px dashed #dee2e6;"></div>
            </div>
        `,
        initScript: function() {
            // Load QR code library if not loaded
            if (typeof QRCode === 'undefined') {
                const script = document.createElement('script');
                script.src = 'js/qrcode.min.js';
                script.onload = function() {
                    console.log('QRCode library loaded');
                };
                document.head.appendChild(script);
            }
            
            // Define generateQR function
            window.generateQR = function() {
                const text = document.getElementById("qrText").value;
                console.log("Generating QR for:", text);
                
                if (!text.trim()) {
                    alert("Please enter some text to generate QR code");
                    return;
                }
                
                const qrElement = document.getElementById("qrcode");
                qrElement.innerHTML = "";
                
                try {
                    if (typeof QRCode === 'undefined') {
                        console.error("QRCode library not loaded");
                        alert("QRCode library not loaded. Please try again.");
                        return;
                    }
                    
                    new QRCode(qrElement, {
                        text: text,
                        width: 256,
                        height: 256,
                        colorDark: "#000000",
                        colorLight: "#ffffff"
                    });
                    console.log("QR code generated successfully");
                } catch (error) {
                    console.error("Error generating QR code:", error);
                    alert("Error generating QR code: " + error.message);
                }
            };
        }
    },
    scan: {
        title: '📷 QR Code Scanner',
        content: `
            <div style="text-align: center;">
                <div style="background: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; 
                    padding: 15px; margin: 15px 0; color: #004085;">
                    <p style="margin: 5px 0; font-size: 14px;"><strong>📱 How to use:</strong> Allow camera access when prompted. Point at any QR code to scan.</p>
                </div>
                
                <button id="scan-button" onclick="startScanning()" 
                    style="display: inline-block; padding: 12px 24px; background: #10b981; 
                    color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; 
                    font-weight: 600; margin: 15px 5px;">
                    Start Scan
                </button>
                
                <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e9ecef;">
                    <div style="font-weight: 600; color: #495057; margin-bottom: 10px; font-size: 1.1rem;">📋 Scan Result:</div>
                    <div id="result" style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;
                        font-family: Monaco, Menlo, monospace; font-size: 14px; word-break: break-all; min-height: 50px;
                        display: flex; align-items: center; justify-content: center; color: #28a745; font-weight: 500;">
                        Initializing scanner...
                    </div>
                    <button id="copy-button" onclick="copyToClipboard()" 
                        style="display: none; padding: 8px 16px; background: #10b981; color: white; border: none; 
                        border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; margin-top: 10px;">
                        📋 Copy to Clipboard
                    </button>
                </div>
                
                <div id="reader" style="width: 100%; max-width: 400px; margin: 15px auto;"></div>
            </div>
        `,
        initScript: function() {
            // Load HTML5 QR code scanner library if not loaded
            if (typeof Html5Qrcode === 'undefined') {
                const script = document.createElement('script');
                script.src = 'js/html5-qrcode.min.js';
                script.onload = function() {
                    console.log('Html5Qrcode library loaded');
                };
                document.head.appendChild(script);
            }
            
            // Initialize scanner variables
            window.html5Qrcode = null;
            window.isScanning = false;
            window.lastScannedText = "";
            
            // Define scanner functions
            window.onScanSuccess = function(decodedText, decodedResult) {
                console.log("QR Code scanned successfully:", decodedText);
                window.lastScannedText = decodedText;
                
                const resultElement = document.getElementById("result");
                
                // Check if it's a URL and make it clickable
                if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                    resultElement.innerHTML = `<a href="${escapeHtml(decodedText)}" target="_blank" rel="noopener noreferrer">${escapeHtml(decodedText)}</a>`;
                } else {
                    resultElement.innerText = decodedText;
                }
                
                resultElement.style.color = "#28a745";
                resultElement.style.fontWeight = "bold";
                
                // Stop scanning automatically after successful scan
                window.stopScanning();
                
                // Show scan again button
                document.getElementById("scan-button").style.display = "inline-block";
                document.getElementById("scan-button").innerText = "Scan Again";
                
                // Show copy button
                document.getElementById("copy-button").style.display = "inline-block";
            };
            
            window.onScanFailure = function(error) {
                // Only log significant errors
                if (!error.includes("No MultiFormat Readers were able to detect the code") && 
                    !error.includes("NotFoundException")) {
                    console.log("Scan error:", error);
                }
            };
            
            window.escapeHtml = function(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };
            
            window.startScanning = async function() {
                if (window.isScanning) return;
                
                const scanButton = document.getElementById("scan-button");
                const copyButton = document.getElementById("copy-button");
                
                scanButton.style.display = "none";
                copyButton.style.display = "none";
                
                const resultElement = document.getElementById("result");
                resultElement.style.color = "#6c757d";
                resultElement.innerText = "📱 Point camera at QR code...";
                
                try {
                    window.html5Qrcode = new Html5Qrcode("reader");
                    
                    const devices = await Html5Qrcode.getCameras();
                    console.log("Available cameras:", devices);
                    
                    let cameraId = null;
                    if (devices && devices.length > 0) {
                        const backCamera = devices.find(device => 
                            device.label.toLowerCase().includes('back') || 
                            device.label.toLowerCase().includes('rear') ||
                            device.label.toLowerCase().includes('environment')
                        );
                        cameraId = backCamera ? backCamera.id : devices[devices.length - 1].id;
                    }
                    
                    const config = { fps: 10, qrbox: 250 };
                    
                    if (cameraId) {
                        await window.html5Qrcode.start(cameraId, config, window.onScanSuccess, window.onScanFailure);
                    } else {
                        await window.html5Qrcode.start({ facingMode: "environment" }, config, window.onScanSuccess, window.onScanFailure);
                    }
                    
                    window.isScanning = true;
                    console.log("QR Code scanner started successfully");
                    
                } catch (error) {
                    console.error("Error starting QR code scanner:", error);
                    resultElement.innerText = "❌ Camera access failed";
                    resultElement.style.color = "#dc3545";
                    scanButton.style.display = "inline-block";
                    scanButton.innerText = "Try Again";
                }
            };
            
            window.stopScanning = async function() {
                if (window.html5Qrcode && window.isScanning) {
                    try {
                        await window.html5Qrcode.stop();
                        console.log("Scanner stopped successfully");
                    } catch (err) {
                        console.error("Error stopping scanner:", err);
                    }
                    window.isScanning = false;
                }
            };
            
            window.copyToClipboard = function() {
                if (!window.lastScannedText) return;
                
                const copyButton = document.getElementById("copy-button");
                
                navigator.clipboard.writeText(window.lastScannedText).then(() => {
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = "✓ Copied!";
                    copyButton.style.background = "#10b981";
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.style.background = "#10b981";
                    }, 2000);
                }).catch(err => {
                    console.error("Failed to copy:", err);
                    copyButton.innerHTML = "❌ Copy failed";
                });
            };
        }
    }
};

// Store original grid content
let originalGridContent = '';

// Show app content
function showAppContent(appKey) {
    const app = appContent[appKey];
    const gridMenu = document.getElementById('gridMenu');
    const backBtn = document.getElementById('backBtn');
    const homeBtn = document.getElementById('homeBtn');
    
    if (app) {
        // Store original content if not already stored
        if (!originalGridContent) {
            originalGridContent = gridMenu.innerHTML;
        }
        
        // Replace grid content with app content
        gridMenu.innerHTML = `
            <div class="app-content">
                <h3>${app.title}</h3>
                ${app.content}
            </div>
        `;
        
        // Show back button, hide home button
        backBtn.style.display = 'block';
        homeBtn.style.display = 'none';
        
        // Initialize app-specific scripts
        if (app.initScript) {
            app.initScript();
        }
    }
}

// Show grid menu
function showGridMenu() {
    const gridMenu = document.getElementById('gridMenu');
    const backBtn = document.getElementById('backBtn');
    const homeBtn = document.getElementById('homeBtn');
    
    // Stop scanner if it's running
    if (window.html5Qrcode && window.isScanning) {
        window.stopScanning();
    }
    
    // Restore original grid content
    gridMenu.innerHTML = originalGridContent;
    
    // Hide back button, show home button
    backBtn.style.display = 'none';
    homeBtn.style.display = 'block';
    
    // Reattach event listeners to menu items
    attachMenuItemListeners();
}

// Attach event listeners to menu items
function attachMenuItemListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const appKey = this.getAttribute('data-app');
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            showAppContent(appKey);
        });
        
        // Hover effects
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.menu-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.menu-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// Handle menu item clicks
document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    const gridMenu = document.getElementById('gridMenu');
    
    // Store original content
    originalGridContent = gridMenu.innerHTML;
    
    // Attach menu item listeners
    attachMenuItemListeners();
    
    // Back button click handler
    backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showGridMenu();
    });
    
    // Add smooth page load animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add touch feedback for mobile
document.addEventListener('touchstart', function() {}, {passive: true});
