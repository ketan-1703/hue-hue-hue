# Use Ubuntu as base image for better LibreOffice support
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=3000

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install LibreOffice and Indian language fonts
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    fonts-indic \
    fonts-deva \
    fonts-tamil \
    fonts-telugu \
    fonts-bengali \
    fonts-gujarati \
    fonts-kannada \
    fonts-malayalam \
    fonts-punjabi \
    fonts-oriya \
    fonts-assamese \
    fonts-manjari \
    fonts-noto-sans \
    fonts-noto-serif \
    fonts-noto-sans-devanagari \
    fonts-noto-sans-tamil \
    fonts-noto-sans-telugu \
    fonts-noto-sans-bengali \
    fonts-noto-sans-gujarati \
    fonts-noto-sans-kannada \
    fonts-noto-sans-malayalam \
    fonts-noto-sans-punjabi \
    fonts-noto-sans-oriya \
    fonts-noto-sans-assamese \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads converted

# Set proper permissions
RUN chmod 755 uploads converted

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
