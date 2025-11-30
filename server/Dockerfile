FROM node:24

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY tsconfig.json ./
# COPY ./src/drizzle.config.ts ./src/


RUN npm install

# Copy source code
COPY . .

# Create a non-root user
RUN addgroup --gid 1001 --system nodejs
RUN adduser --system nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

# Use development command by default
CMD ["npm", "run", "dev"]