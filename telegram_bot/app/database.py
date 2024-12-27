import asyncpg
from config.settings import DATABASE_URL

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        if not self.pool:
            self.pool = await asyncpg.create_pool(DATABASE_URL)

    async def close(self):
        if self.pool:
            await self.pool.close()

    async def user_exists(self, user_id):
        async with self.pool.acquire() as connection:
            query = "SELECT EXISTS (SELECT 1 FROM Users WHERE telegramid = $1)"
            return await connection.fetchval(query, user_id)
        
    async def add_user(self, user_id, name):
        async with self.pool.acquire() as connection:
            query = "INSERT INTO Users (telegramid, name, premium) VALUES ($1, $2, $3)"
            await connection.execute(query, user_id, name, 0)

db = Database()