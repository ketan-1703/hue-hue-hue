const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');
const morgan = require('morgan');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/convert', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.vercel.app'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(convertedDir);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = ['.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
        return cb(new Error('Only .docx files are allowed'), false);
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        return cb(new Error('File size must be less than 10MB'), false);
    }
    
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    }
});

// Utility function to clean up files
async function cleanupFiles(filePath, convertedPath) {
    try {
        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
        }
        if (await fs.pathExists(convertedPath)) {
            await fs.remove(convertedPath);
        }
    } catch (error) {
        console.error('Error cleaning up files:', error);
    }
}

// Utility function to check if LibreOffice is available
async function checkLibreOffice() {
    try {
        await execAsync('libreoffice --version');
        return true;
    } catch (error) {
        console.error('LibreOffice not found:', error.message);
        return false;
    }
}

// Convert Word to PDF using LibreOffice
async function convertToPdf(inputPath, outputPath) {
    try {
        // Check if LibreOffice is available
        const libreOfficeAvailable = await checkLibreOffice();
        if (!libreOfficeAvailable) {
            throw new Error('LibreOffice is not installed or not available in PATH');
        }

        // Convert using LibreOffice in headless mode
        const command = `libreoffice --headless --convert-to pdf --outdir "${path.dirname(outputPath)}" "${inputPath}"`;
        
        const { stdout, stderr } = await execAsync(command, {
            timeout: 60000, // 60 seconds timeout
            maxBuffer: 1024 * 1024 // 1MB buffer
        });

        if (stderr && !stderr.includes('Warning')) {
            throw new Error(`LibreOffice conversion error: ${stderr}`);
        }

        // Check if the converted file exists
        const expectedPdfPath = outputPath.replace('.docx', '.pdf');
        if (!await fs.pathExists(expectedPdfPath)) {
            throw new Error('PDF conversion failed - output file not found');
        }

        return expectedPdfPath;
    } catch (error) {
        console.error('Conversion error:', error);
        throw new Error(`PDF conversion failed: ${error.message}`);
    }
}

// Main conversion endpoint
app.post('/convert', 
    upload.single('document'),
    [
        body('document').custom((value, { req }) => {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
            return true;
        })
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: errors.array()[0].msg
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            const inputPath = req.file.path;
            const originalName = req.file.originalname;
            const outputFileName = `${path.parse(originalName).name}.pdf`;
            const outputPath = path.join(convertedDir, outputFileName);

            console.log(`Starting conversion: ${originalName} -> ${outputFileName}`);

            // Convert the file
            const convertedPath = await convertToPdf(inputPath, outputPath);

            // Set up cleanup after response
            const cleanupTimeout = setTimeout(() => {
                cleanupFiles(inputPath, convertedPath);
            }, 5 * 60 * 1000); // Clean up after 5 minutes

            // Send success response
            res.json({
                success: true,
                message: 'File converted successfully',
                filename: outputFileName,
                downloadUrl: `/download/${encodeURIComponent(outputFileName)}`,
                originalName: originalName
            });

        } catch (error) {
            console.error('Conversion error:', error);
            
            // Clean up uploaded file on error
            if (req.file) {
                await cleanupFiles(req.file.path, '');
            }

            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred during conversion'
            });
        }
    }
);

// Download endpoint
app.get('/download/:filename', async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(convertedDir, filename);

        // Security check - prevent directory traversal
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(convertedDir))) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Clean up file after download
        fileStream.on('end', () => {
            setTimeout(() => {
                fs.remove(filePath).catch(err => {
                    console.error('Error cleaning up downloaded file:', err);
                });
            }, 1000);
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: 'Error downloading file'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size must be less than 10MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Only one file can be uploaded at a time'
            });
        }
    }

    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`📁 Converted directory: ${convertedDir}`);
    console.log(`🔒 Rate limiting: 10 requests per 15 minutes`);
    console.log(`📄 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
