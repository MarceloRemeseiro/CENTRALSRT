# Dockerfile
FROM node:18-alpine

# Instalar OpenSSL y otras dependencias necesarias
RUN apk add --no-cache openssl openssl-dev

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que se ejecuta la aplicación
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]
