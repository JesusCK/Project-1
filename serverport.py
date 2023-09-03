import mysql.connector
import socket
from datetime import datetime

# Configuración de la conexión a la base de datos
db_config = {
    "host": "locationdb.col4pixfadqv.us-east-2.rds.amazonaws.com",
    "user": "root",
    "password": "123456789",
    "database": "LocationDB"
}

# Función para insertar datos en la base de datos
def insert_data(lat, lon, timestamp):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "INSERT INTO gps (Latitud, Longitud, Estampa_de_tiempo) VALUES (%s, %s, %s)"
        values = (lat, lon, timestamp)
        cursor.execute(query, values)
        connection.commit()
        print("Registro insertado:", values)

    except mysql.connector.Error as err:
        print("Error:", err)

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("Conexión cerrada")

# Configuración del socket para recibir datos
server_address = ('192.168.101.71', 5800)  # Cambia la dirección y el puerto según tu configuración
buffer_size = 1024

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
    sock.bind(server_address)

    print("Esperando datos en", server_address)

    while True:
        data, _ = sock.recvfrom(buffer_size)
        data = data.decode("utf-8")
        lat, lon, timestamp_str = data.split(",")
        timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
        insert_data(lat, lon, timestamp)
        print("Datos recibidos y guardados:", lat, lon, timestamp)
