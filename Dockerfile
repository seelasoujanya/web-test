# Stage 1: Build Angular app
FROM node:18.17.0-alpine AS builder

# Set working directory inside the container
WORKDIR /app-ui

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install npm dependencies
RUN npm cache clear -f
RUN npm config set registry "https://registry.npmjs.org"
RUN npm install

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy all files from the current directory to the working directory
COPY . .

# Define a build argument for the environment
ARG ENV=prod

# Build the Angular app with a specific configuration named 'test'
RUN npm run build:${ENV}

# Stage 2: Create nginx server to serve the built Angular app
FROM nginx:alpine

# Copy custom nginx configuration file to replace the default nginx configuration
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular app from the 'builder' stage to the nginx html directory
COPY --from=builder /app-ui/dist/deliver-upgrade-frontend /usr/share/nginx/html

# Expose port 80 to allow external access to the nginx
EXPOSE 80
