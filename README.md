# Word to PDF Converter

A complete web application that converts Word (.docx) documents to PDF while preserving formatting and Indian language content.

## 🌟 Features

- **Indian Language Support**: Preserves Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and other Indian languages
- **Format Preservation**: Maintains original formatting, fonts, and layout
- **Secure Processing**: Files are automatically deleted after conversion
- **Responsive Design**: Modern, mobile-friendly interface
- **Drag & Drop**: Easy file upload with drag and drop support
- **Progress Tracking**: Real-time conversion progress
- **Rate Limiting**: Prevents abuse with request limiting

## 🏗️ Architecture

### Frontend (Vercel-compatible)
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Bootstrap and custom animations
- **JavaScript**: ES6+ with async/await for smooth UX
- **Responsive**: Mobile-first design approach

### Backend (Render/Railway compatible)
- **Node.js + Express**: Fast, scalable server
- **LibreOffice**: Headless PDF conversion with Indian font support
- **Multer**: Secure file upload handling
- **Security**: Rate limiting, CORS, helmet protection
- **Docker**: Containerized deployment with Indian language fonts

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd word-to-pdf-converter
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install LibreOffice (for local development)**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install libreoffice fonts-indic fonts-noto-sans-devanagari
   
   # macOS
   brew install libreoffice
   
   # Windows
   # Download from https://www.libreoffice.org/download/download/
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

5. **Serve the frontend**
   ```bash
   cd ../frontend
   # Use any static file server
   python -m http.server 8000
   # or
   npx serve .
   ```

6. **Access the application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3000

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000

## 🌐 Deployment

### Frontend (Vercel)

1. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy frontend
   cd frontend
   vercel
   ```

2. **Update API endpoint**
   - Edit `script.js` and update the `apiEndpoint` to your backend URL

### Backend (Render/Railway)

1. **Deploy to Render**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables if needed

2. **Deploy to Railway**
   - Connect your GitHub repository
   - Railway will auto-detect Node.js and deploy

3. **Update CORS settings**
   - Edit `backend/server.js` and update the CORS origin to your frontend domain

## 🔧 Configuration

### Environment Variables

```bash
# Backend
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### API Endpoints

- `POST /convert` - Convert Word to PDF
- `GET /download/:filename` - Download converted PDF
- `GET /health` - Health check

## 🛡️ Security Features

- **File Validation**: Only .docx files accepted
- **Size Limits**: 10MB maximum file size
- **Rate Limiting**: 10 requests per 15 minutes per IP
- **CORS Protection**: Configured for production domains
- **Helmet Security**: HTTP headers protection
- **Input Validation**: Express-validator middleware
- **File Cleanup**: Automatic deletion after conversion

## 🇮🇳 Indian Language Support

The application includes comprehensive support for Indian languages:

### Supported Languages
- **Hindi** (हिंदी) - Devanagari script
- **Tamil** (தமிழ்) - Tamil script
- **Telugu** (తెలుగు) - Telugu script
- **Bengali** (বাংলা) - Bengali script
- **Marathi** (मराठी) - Devanagari script
- **Gujarati** (ગુજરાતી) - Gujarati script
- **Kannada** (ಕನ್ನಡ) - Kannada script
- **Malayalam** (മലയാളം) - Malayalam script
- **Punjabi** (ਪੰਜਾਬੀ) - Gurmukhi script
- **Odia** (ଓଡ଼ିଆ) - Odia script
- **Assamese** (অসমীয়া) - Bengali script

### Font Support
The Docker image includes:
- `fonts-indic` - Comprehensive Indian font package
- `fonts-noto-sans-*` - Google Noto fonts for each script
- `fonts-deva`, `fonts-tamil`, etc. - Individual script fonts

## 📁 Project Structure

```
word-to-pdf-converter/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Custom styles
│   └── script.js           # Frontend logic
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   ├── Dockerfile          # Docker configuration
│   ├── uploads/            # Temporary upload directory
│   └── converted/          # Temporary output directory
├── docker-compose.yml      # Docker deployment
└── README.md              # This file
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Manual Testing
1. Create a Word document with Indian language content
2. Upload via the web interface
3. Verify PDF output preserves formatting and fonts

## 🔍 Troubleshooting

### Common Issues

1. **LibreOffice not found**
   ```bash
   # Install LibreOffice
   sudo apt-get install libreoffice
   ```

2. **Font rendering issues**
   ```bash
   # Install Indian fonts
   sudo apt-get install fonts-indic fonts-noto-sans-devanagari
   ```

3. **CORS errors**
   - Update CORS origin in `backend/server.js`
   - Ensure frontend URL is correct

4. **File upload fails**
   - Check file size (max 10MB)
   - Ensure file is .docx format
   - Verify upload directory permissions

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Verify your deployment configuration 