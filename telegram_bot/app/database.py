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
            query = "SELECT EXISTS (SELECT 1 FROM Users WHERE telgramid = $1)"
            return await connection.fetchval(query, user_id)

db = Database()

# import asyncpg

# async def user_exists(user_id: int) -> bool:
#     """Check if a user exists in the Users table."""
#     connection = await asyncpg.connect(**DATABASE_CONFIG)
#     try:
#         query = "SELECT EXISTS (SELECT 1 FROM users WHERE telgramid = $1)"
#         exists = await connection.fetchval(query, user_id)
#         return exists
#     finally:
#         await connection.close()

# # Check if the user exists in the database
#     exists = await user_exists(user.id)
#     if not exists:
#         await update.message.reply_text(
#             "You are not registered in our system. Please contact support to gain access."
#         )
#         return
    