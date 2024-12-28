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
    
    async def remove_user(self, user_id):
        exist = await self.user_exists(user_id)
        if exist:
            async with self.pool.acquire() as connection:
                query = "DELETE FROM Users WHERE telegramid = $1"
                await connection.execute(query, user_id)

    async def get_user_info(self, user_id):
        exist = await self.user_exists(user_id)
        if exist:
            async with self.pool.acquire() as connection:
                query = "SELECT * FROM Users WHERE telegramid = $1"
                return await connection.fetchrow(query, user_id)
            
    async def get_user_devices(self, user_id):
        exist = await self.user_exists(user_id)
        if exist:
            async with self.pool.acquire() as connection:
                query = "SELECT * FROM Devices WHERE userid = $1"
                return await connection.fetch(query, user_id)
            
    async def add_device(self, user_id: int, serial_number: str) -> None:
        """Add a device to the database."""
        async with self.pool.acquire() as connection:
            query = "INSERT INTO devices (user_id, serial_number) VALUES ($1, $2)"
            await connection.execute(query, user_id, serial_number)
            
db = Database()