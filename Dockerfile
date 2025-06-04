FROM node:22

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build
RUN npx playwright install-deps
RUN npx playwright install chromium

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 