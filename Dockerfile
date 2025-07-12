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

# Install LibreOffice and Hindi/English fonts
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    fonts-deva \
    fonts-noto-sans \
    fonts-noto-serif \
    fonts-noto-sans-devanagari \
    fonts-noto-serif-devanagari \
    fonts-lohit-deva \
    fonts-khmeros \
    fonts-kacst \
    fonts-freefont-ttf \
    fonts-liberation \
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
