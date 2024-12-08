import os
import time
import requests
import socket
import uuid
from datetime import datetime

# Configuración
API_URL = "http://host.docker.internal:3001/api/devices"
DEVICE_ID = os.getenv('DEVICE_ID', f"RASPI_{str(uuid.uuid4())[:8]}")
PING_INTERVAL = 10  # segundos

def get_ip_address():
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    return ip_address

def register_device():
    ip_address = get_ip_address()
    
    data = {
        "device_id": DEVICE_ID,
        "ip_address": ip_address
    }
    
    try:
        response = requests.post(API_URL, json=data)
        if response.status_code == 200:
            print(f"Dispositivo actualizado: {DEVICE_ID}")
            print(f"IP: {ip_address}")
            return True
        else:
            print(f"Error al actualizar dispositivo: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error de conexión: {e}")
        return False

def main():
    print(f"Iniciando dispositivo: {DEVICE_ID}")
    
    while True:
        if register_device():
            print(f"Dispositivo {DEVICE_ID} en línea")
        else:
            print(f"Error al registrar {DEVICE_ID}, reintentando...")
        
        time.sleep(PING_INTERVAL)

if __name__ == "__main__":
    main() 