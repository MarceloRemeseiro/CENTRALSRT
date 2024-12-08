FROM arm64v8/python:3.11-slim

WORKDIR /app

# Instalamos las dependencias necesarias
RUN apt-get update && apt-get install -y \
    iputils-ping \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiamos nuestro código
COPY device.py .
COPY requirements.txt .

# Instalamos las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Ejecutamos nuestro script
CMD ["python", "device.py"] 