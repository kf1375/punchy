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

    async def user_exists(self, telegram_id: int):
        async with self.pool.acquire() as connection:
            query = "SELECT EXISTS (SELECT 1 FROM users WHERE telegram_id = $1)"
            return await connection.fetchval(query, telegram_id)
        
    async def add_user(self, telegram_id: int, name: str):
        async with self.pool.acquire() as connection:
            query = "INSERT INTO users (telegram_id, name, subscription_type) VALUES ($1, $2, $3)"
            await connection.execute(query, telegram_id, name, 0)
    
    async def remove_user(self, telegram_id: int):
        exist = await self.user_exists(telegram_id)
        if exist:
            async with self.pool.acquire() as connection:
                query = "DELETE FROM users WHERE telegram_id = $1"
                await connection.execute(query, telegram_id)

    async def get_user_by_telegram_id(self, telegram_id: int):
        exist = await self.user_exists(telegram_id)
        if exist:
            async with self.pool.acquire() as connection:
                query = "SELECT * FROM users WHERE telegram_id = $1"
                return await connection.fetchrow(query, telegram_id)
            
    async def get_user_devices(self, telegram_id: int):
        exist = await self.user_exists(telegram_id)
        if exist:
            user = await self.get_user_by_telegram_id(telegram_id)
            async with self.pool.acquire() as connection:
                query = "SELECT * FROM devices WHERE user_id = $1"
                return await connection.fetch(query, user['user_id'])
    
    async def device_exists(self, serial_number: str):
        async with self.pool.acquire() as connection:
            query = "SELECT EXISTS (SELECT 1 FROM devices WHERE serial_number = $1)"
            return await connection.fetchval(query, serial_number)
        
    async def add_device(self, user_telegram_id: int, device_serial_number: str, device_name: str) -> None:
        """Add a device to the database."""
        user_exist = await self.user_exists(user_telegram_id)
        device_exist = await self.device_exists(device_serial_number)
        if not device_exist and user_exist:
            user = await self.get_user_by_telegram_id(user_telegram_id)
            async with self.pool.acquire() as connection:
                query = "INSERT INTO devices (serial_number, name, user_id) VALUES ($1, $2, $3)"
                await connection.execute(query, device_serial_number, device_name, user['user_id'])
            
db = Database()