from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters

from app.commands import Commands
from app.menus import Menus
from app.callbacks import Callbacks

from config.settings import BOT_TOKEN

def main() -> None:
    """Start the bot."""
    application = Application.builder().token(BOT_TOKEN).build()

    # Register handlers
    application.add_handler(CommandHandler("start", Commands.start))
    application.add_handler(CommandHandler("help",  Commands.help_command))
    application.add_handler(CommandHandler("motor_speed", Commands.set_motor_speed))

    application.add_handler(CallbackQueryHandler(Callbacks.sign_up, pattern="SIGN_UP"))
    application.add_handler(CallbackQueryHandler(Callbacks.devices, pattern="DEVICES"))
    application.add_handler(CallbackQueryHandler(Callbacks.profile, pattern="PROFILE"))
    application.add_handler(CallbackQueryHandler(Callbacks.help, pattern="HELP"))

    application.add_handler(CallbackQueryHandler(Callbacks.back_to_main, pattern="BACK_TO_MAIN"))

    application.add_handler(CallbackQueryHandler(Callbacks.add_new_device, pattern="ADD_NEW_DEVICE"))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, Callbacks.handle_serial_number))
    application.add_handler(MessageHandler(filters.PHOTO, Callbacks.handle_qr_code))
    application.add_handler(CallbackQueryHandler(Callbacks.confirm_add_device, pattern="CONFIRM_ADD_DEVICE"))
    application.add_handler(CallbackQueryHandler(Callbacks.cancel_add_device, pattern="CANCEL_ADD_DEVICE"))
    application.add_handler(CallbackQueryHandler(Callbacks.control_device, pattern="CONTROL_DEVICE_"))

    application.add_handler(CallbackQueryHandler(Callbacks.get_device_status, pattern="GET_DEVICE_STATUS_"))
    application.add_handler(CallbackQueryHandler(Callbacks.set_device_state, pattern="SET_DEVICE_STATE_"))
    application.add_handler(CallbackQueryHandler(Callbacks.set_device_speed, pattern="SET_DEVICE_SPEED_"))
    application.add_handler(CallbackQueryHandler(Callbacks.remove_device, pattern="REMOVE_DEVICE_"))
    application.add_handler(CallbackQueryHandler(Callbacks.confirm_remove_device, pattern="CONFIRM_REMOVE_"))
    application.add_handler(CallbackQueryHandler(Callbacks.devices, pattern="BACK_TO_DEVICES"))
    # Start the Bot
    application.run_polling()

if __name__ == '__main__':
    main()