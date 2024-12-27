from asyncer import syncify

from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

from app.commands import Commands
from app.menus import Menus
from app.callbacks import Callbacks
from app.database import db
from config.settings import BOT_TOKEN

async def set_database():
    await db.connect()

def main() -> None:
    """Start the bot."""
    application = Application.builder().token(BOT_TOKEN).build()

    # Set up the database
    syncify(set_database)()

    # Register handlers
    application.add_handler(CommandHandler("start", Commands.start))
    application.add_handler(CommandHandler("help", Commands.help_command))
    application.add_handler(CommandHandler("motor_speed", Commands.set_motor_speed))
    # application.add_handler(CallbackQueryHandler(Callbacks.button))
    application.add_handler(CallbackQueryHandler(Callbacks.sign_up, pattern="SIGN_UP"))

    # Start the Bot
    application.run_polling()

if __name__ == '__main__':
    main()