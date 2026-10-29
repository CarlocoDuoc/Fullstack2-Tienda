# ---- Etapa 1: compilar el frontend con Vite ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL vacío = el navegador llama a /api en el mismo origen (nginx lo redirige a la API)
RUN npm run build

# ---- Etapa 2: servir los archivos estáticos con nginx ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
