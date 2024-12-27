from telegram import Update, BotCommand, BotCommandScopeChat
from telegram.ext import ContextTypes
from app.menus import Menus
from app.database import db

class Commands:
    """Class to manage bot commands."""

    @staticmethod
    async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Send a message when the command /start is issued."""
        
        chat_id = update.effective_chat.id
        user = update.effective_user

        await db.connect()

        exists = await db.user_exists(user.id)
        if not exists:
            message = await update.message.reply_markdown_v2(
                fr'Hi {user.mention_markdown_v2()}\! You are not registered in our system\.'
            )
            await Menus.show_signup_menu(message)
            return
        
        message = await update.message.reply_markdown_v2(
            fr'Welcome Back {user.mention_markdown_v2()}\! I am your motor control bot\. Use the buttons below to control the motor\.',
        )
        await Menus.show_main_menu(message)

        # Set chat-specific commands
        commands = [
            BotCommand("help", "Show help message"),
            BotCommand("motor_speed", "Set motor speed, usage: /motor_speed <SINGLE_SPEED|INFINITE_SPEED> <speed>"),
        ]
        await context.bot.set_my_commands(commands, scope=BotCommandScopeChat(chat_id))

    @staticmethod
    async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Send a help message when the command /help is issued."""
        user = update.effective_user
        message = await update.message.reply_markdown_v2(
            fr'Hi {user.mention_markdown_v2()}\! I am your motor control bot\. Use the buttons below to control the motor\.',
        )
        await Menus.show_main_menu(message)

    @staticmethod
    async def set_motor_speed(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Set the motor speed from user input."""
        if len(context.args) == 2 and context.args[1].isdigit() and context.args[0] in ['SINGLE_SPEED', 'INFINITE_SPEED']:
            speed_type = context.args[0]
            speed_value = int(context.args[1])
            context.user_data[speed_type] = speed_value  # Save speed in user data
            await update.message.reply_text(f'Motor speed set to {speed_value} with type {speed_type}')
        else:
            await update.message.reply_text('Usage: /motor_speed <SINGLE_SPEED|INFINITE_SPEED> <speed>')
