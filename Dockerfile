# Use Ubuntu as base image
FROM ubuntu:22.04

# Install Node.js, npm and dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and Chrome
RUN npm install
RUN npx @puppeteer/browsers install chrome --path /app/node_modules/puppeteer/.local-chromium

# Copy source files
COPY . ./

# Build
RUN npm run build

# Start
CMD export PUPPETEER_EXECUTABLE_PATH=$(find /app/node_modules/puppeteer/.local-chromium -type f -name "chrome" | head -n 1) && npm start 