import anyio
from asyncer import syncify, asyncify

from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

from app.commands import Commands
from app.menus import Menus
from app.callbacks import Callbacks
from app.database import db
from config.settings import BOT_TOKEN

def start_bot():
    """Start the bot."""
    application = Application.builder().token(BOT_TOKEN).build()

    # Register handlers
    application.add_handler(CommandHandler("start", Commands.start))
    application.add_handler(CommandHandler("help", Commands.help_command))
    application.add_handler(CommandHandler("motor_speed", Commands.set_motor_speed))
    # application.add_handler(CallbackQueryHandler(Callbacks.button))
    application.add_handler(CallbackQueryHandler(Callbacks.sign_up, pattern="SIGN_UP"))

    # Start the Bot
    application.run_polling()

async def main() -> None:
    # Set up the database
    await db.connect()

    await asyncify(start_bot)()

if __name__ == "__main__":
    anyio.run(main)