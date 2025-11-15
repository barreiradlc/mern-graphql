FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

# Copy source code
COPY . .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

# Use development command by default
CMD ["npm", "run", "dev"]