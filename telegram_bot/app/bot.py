import asyncio

from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

from app.commands import Commands
from app.menus import Menus
from app.database import db

from config.settings import BOT_TOKEN

# async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
#     """Send a message when the command /start is issued."""
#     chat_id = update.effective_chat.id
#     user = update.effective_user
    
#     message = await update.message.reply_markdown_v2(
#         fr'Hi {user.mention_markdown_v2()}\! I am your motor control bot\. Use the buttons below to control the motor\.',
#     )
#     await show_main_menu(message)

#     # Set chat-specific commands
#     commands = [
#         BotCommand("help", "Show help message"),
#         BotCommand("motor_speed", "Set motor speed, usage: /motor_speed <SINGLE_SPEED|INFINITE_SPEED> <speed>")
#     ]
#     await context.bot.set_my_commands(commands, scope=BotCommandScopeChat(chat_id))

# async def show_main_menu(message) -> None:
#     """Show a menu of commands using inline buttons."""
#     keyboard = [
#         [InlineKeyboardButton("Start Single", callback_data='START_SINGLE')],
#         [InlineKeyboardButton("Start Infinite", callback_data='START_INFINITE')],
#         [InlineKeyboardButton("Stop Infinite", callback_data='STOP_INFINITE')],
#         [InlineKeyboardButton("Set Single Speed", callback_data='SET_SINGLE_SPEED')],
#         [InlineKeyboardButton("Set Infinite Speed", callback_data='SET_INFINITE_SPEED')]
#     ]
#     reply_markup = InlineKeyboardMarkup(keyboard)
#     await message.reply_text('Please choose:', reply_markup=reply_markup)

# async def show_speed_menu(message, speed_type) -> None:
#     """Show a menu for increasing or decreasing speed."""
#     keyboard = [
#         [InlineKeyboardButton("Increase", callback_data=f'INC_{speed_type}')],
#         [InlineKeyboardButton("Decrease", callback_data=f'DEC_{speed_type}')],
#         [InlineKeyboardButton("Back", callback_data='BACK_TO_MAIN')]
#     ]
#     reply_markup = InlineKeyboardMarkup(keyboard)
#     await message.reply_text(f'Set {speed_type} Speed:', reply_markup=reply_markup)


# async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
#     """Send a message when the command /help is issued."""
#     user = update.effective_user
#     message = await update.message.reply_markdown_v2(
#         fr'Hi {user.mention_markdown_v2()}\! I am your motor control bot\. Use the buttons below to control the motor\.',
#     )
#     await show_main_menu(message)

# async def set_motor_speed(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
#     """Get the motor speed from the user and send it to the MQTT broker."""
#     if len(context.args) == 2 and context.args[1].isdigit() and context.args[0] in ['SINGLE_SPEED', 'INFINITE_SPEED']:
#         speed_type = context.args[0]
#         speed_value = int(context.args[1])
#         context.user_data[speed_type] = speed_value  # Save speed in user data
#         payload = json.dumps({"type": speed_type, "speed": speed_value})
#         # mqtt_client.publish(MQTT_TOPIC_SPEED, payload)
#         message = await update.message.reply_text(f'Motor speed set to {speed_value} with type {speed_type}')
#     else:
#         message = await update.message.reply_text('Usage: /motor_speed <SINGLE_SPEED|INFINITE_SPEED> <speed>')
    
#     await show_main_menu(message)
    
def main() -> None:
    """Start the bot."""
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Connect to the MQTT broker
    # mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    # mqtt_client.loop_start()

    # Register handlers
    application.add_handler(CommandHandler("start", Commands.start))
    application.add_handler(CommandHandler("help", Commands.help_command))
    application.add_handler(CommandHandler("motor_speed", Commands.set_motor_speed))
    application.add_handler(CallbackQueryHandler(Menus.button))

    # Start the Bot
    application.run_polling()

if __name__ == '__main__':
    main()