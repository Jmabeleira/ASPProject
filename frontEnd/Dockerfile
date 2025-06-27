# Etapa 1: Build
FROM node:20 AS builder

# Directorio de trabajo
WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Ejecutamos el build
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiamos el build generado al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos configuración custom de Nginx (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto por defecto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
