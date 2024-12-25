import os
import psycopg2
from psycopg2 import sql

DATABASE_URL = os.getenv('DATABASE_URL')

# Establish a connection to PostgreSQL
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Insert data into the Users table
cursor.execute("""
    INSERT INTO Users (TelgramID, Name, Premium)
    VALUES (%s, %s, %s);
""", (123456789, 'John Doe', 1))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cursor.close()
conn.close()

print("Data inserted successfully")