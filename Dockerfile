# Etapa de build
FROM node:18 AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero (para aprovechar el cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Ejecutar la compilación de producción
RUN npm run build

# Etapa final para servir con Nginx
FROM nginx:alpine

# Elimina la configuración por defecto de nginx (opcional)
RUN rm -rf /usr/share/nginx/html/*

# Copiar el build generado
COPY --from=build /app/www /usr/share/nginx/html

# Copiar una configuración personalizada de nginx si la tienes
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80 (por convención para HTTP)
EXPOSE 80

# Comando por defecto para nginx
CMD ["nginx", "-g", "daemon off;"]
