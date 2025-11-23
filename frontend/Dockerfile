# Node.js Base Image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
# RUN npm run build # Commented out for dev mode, uncomment for production

# Expose port
EXPOSE 3000

# Command to run the application (Dev mode)
CMD ["npm", "run", "dev"]
