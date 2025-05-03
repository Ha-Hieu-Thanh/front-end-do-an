# Stage 1: Build React app using Yarn
FROM node:18-alpine as builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

# Stage 2: Serve with NGINX
FROM nginx:stable-alpine

# Copy built static files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Optional: overwrite default NGINX config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
