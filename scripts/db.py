import mysql.connector

def get_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Vrau1234!",
        database="PII"
    )
    return connection