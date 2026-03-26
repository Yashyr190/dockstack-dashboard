FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Vite application
RUN npm run build


FROM nginx:alpine

# Copy custom nginx configuration focusing on SPA and proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to nginx public dir
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
