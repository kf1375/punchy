import anyio
from asyncer import syncify, asyncify

from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

from app.commands import Commands
from app.menus import Menus
from app.callbacks import Callbacks
from app.database import db
from config.settings import BOT_TOKEN

# async def set_database():
#     await db.connect()

async def main() -> None:
    """Start the bot."""
    application = Application.builder().token(BOT_TOKEN).build()

    # Set up the database
    await db.connect()

    # Register handlers
    application.add_handler(CommandHandler("start", Commands.start))
    application.add_handler(CommandHandler("help", Commands.help_command))
    application.add_handler(CommandHandler("motor_speed", Commands.set_motor_speed))
    # application.add_handler(CallbackQueryHandler(Callbacks.button))
    application.add_handler(CallbackQueryHandler(Callbacks.sign_up, pattern="SIGN_UP"))

    # Start the Bot
    await asyncify(application.run_polling)()

if __name__ == "__main__":
    anyio.run(main)