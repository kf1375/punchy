import os
import psycopg2
from psycopg2 import sql

DATABASE_URL = os.getenv('DATABASE_URL')

# Establish a connection to PostgreSQL
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

cursor.execute("SELECT * FROM Users")

records = cursor.fetchall()

print(records.size())