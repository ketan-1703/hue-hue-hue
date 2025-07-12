// Word to PDF Converter - Frontend JavaScript

class WordToPdfConverter {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['.docx'];
        this.apiEndpoint = '/convert'; // Will be updated based on deployment
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    initializeElements() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadForm = document.getElementById('uploadForm');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.convertBtn = document.getElementById('convertBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.resultSection = document.getElementById('resultSection');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
    }

    setupEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Form submission
        this.uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleConversion();
        });

        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
    }

    setupDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Handle drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('dragover');
            });
        });

        // Handle file drop
        this.uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        if (!this.isValidFileType(file)) {
            this.showError('Please select a valid .docx file.');
            return;
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
            this.showError(`File size must be less than ${this.formatFileSize(this.maxFileSize)}.`);
            return;
        }

        // Display file info
        this.displayFileInfo(file);
        this.convertBtn.disabled = false;
        this.hideAllSections();
    }

    isValidFileType(file) {
        const fileName = file.name.toLowerCase();
        return this.allowedTypes.some(type => fileName.endsWith(type));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'block';
        this.fileInfo.classList.add('slide-up');
    }

    removeFile() {
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        this.convertBtn.disabled = true;
        this.hideAllSections();
    }

    async handleConversion() {
        const file = this.fileInput.files[0];
        if (!file) {
            this.showError('Please select a file to convert.');
            return;
        }

        this.showProgress();
        this.convertBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('document', file);

            // Simulate progress for better UX
            this.simulateProgress();

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result.downloadUrl, result.filename);
            } else {
                throw new Error(result.error || 'Conversion failed');
            }

        } catch (error) {
            console.error('Conversion error:', error);
            this.showError(error.message || 'An error occurred during conversion. Please try again.');
        } finally {
            this.hideProgress();
            this.convertBtn.disabled = false;
        }
    }

    simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
                clearInterval(interval);
            }
            this.updateProgress(progress);
        }, 200);
    }

    updateProgress(percentage) {
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = this.getProgressText(percentage);
    }

    getProgressText(percentage) {
        if (percentage < 30) return 'Uploading file...';
        if (percentage < 60) return 'Processing document...';
        if (percentage < 90) return 'Converting to PDF...';
        return 'Finalizing conversion...';
    }

    showProgress() {
        this.hideAllSections();
        this.progressSection.style.display = 'block';
        this.progressSection.classList.add('fade-in');
        this.updateProgress(0);
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
    }

    showSuccess(downloadUrl, filename) {
        this.hideAllSections();
        this.downloadBtn.href = downloadUrl;
        this.downloadBtn.download = filename || 'converted.pdf';
        this.resultSection.style.display = 'block';
        this.resultSection.classList.add('success-animation');
    }

    showError(message) {
        this.hideAllSections();
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        this.errorSection.classList.add('fade-in');
    }

    hideAllSections() {
        this.progressSection.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'none';
    }

    // Update API endpoint based on environment
    updateApiEndpoint() {
        // For local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.apiEndpoint = 'https://wordtopdf-j9qq.onrender.com';
        } else {
            // For production - update with your actual backend URL
            this.apiEndpoint = 'https://wordtopdf-j9qq.onrender.com';
        }
    }
}

// Utility functions
function removeFile() {
    if (window.converter) {
        window.converter.removeFile();
    }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new WordToPdfConverter();
    window.converter.updateApiEndpoint();
});

// Add some nice animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation to convert button
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.addEventListener('click', function() {
        if (!this.disabled) {
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="loading-spinner"></span> Converting...';
            this.disabled = true;
            
            // Reset button after a delay (in case of errors)
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 10000);
        }
    });

    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add click animation to upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('click', function() {
        this.classList.add('file-upload-animation');
        setTimeout(() => {
            this.classList.remove('file-upload-animation');
        }, 2000);
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + U to trigger file upload
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        document.getElementById('fileInput').click();
    }
    
    // Enter to submit form when file is selected
    if (e.key === 'Enter' && document.getElementById('fileInput').files.length > 0) {
        e.preventDefault();
        document.getElementById('uploadForm').dispatchEvent(new Event('submit'));
    }
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
