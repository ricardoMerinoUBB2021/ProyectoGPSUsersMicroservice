FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Configure npm for better network resilience
RUN npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set registry https://registry.npmjs.org/

# Install app dependencies
COPY package*.json ./
RUN npm install --no-audit --verbose

# Bundle app source
COPY . .

# Build the application
RUN npm run build

# Expose the service port
EXPOSE 3001

# Define environment variable
ENV NODE_ENV=production

# Run the application using the correct path to the server file
CMD [ "node", "dist/server.js" ] 