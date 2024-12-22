import sqlite3

# SQLite setup
DB_PATH = "/app/data/database.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        with open("schema.sql", "r") as schema_file:
            conn.executescript(schema_file.read())

if __name__ == "__main__":
    # initialize database
    init_db()