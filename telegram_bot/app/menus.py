from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Message, Update
from telegram.ext import ContextTypes

class Menus:
    """Class to manage bot menus and buttons."""

    @staticmethod
    async def show_main_menu(message: Message) -> None:
        """Show the main menu with motor control options."""
        keyboard = [
            [InlineKeyboardButton("Start Single", callback_data='START_SINGLE')],
            [InlineKeyboardButton("Start Infinite", callback_data='START_INFINITE')],
            [InlineKeyboardButton("Stop Infinite", callback_data='STOP_INFINITE')],
            [InlineKeyboardButton("Set Single Speed", callback_data='SET_SINGLE_SPEED')],
            [InlineKeyboardButton("Set Infinite Speed", callback_data='SET_INFINITE_SPEED')],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await message.reply_text('Please choose:', reply_markup=reply_markup)

    @staticmethod
    async def show_speed_menu(message: Message, speed_type: str) -> None:
        """Show a menu for increasing or decreasing motor speed."""
        keyboard = [
            [InlineKeyboardButton("Increase", callback_data=f'INC_{speed_type}')],
            [InlineKeyboardButton("Decrease", callback_data=f'DEC_{speed_type}')],
            [InlineKeyboardButton("Back", callback_data='BACK_TO_MAIN')],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await message.reply_text(f'Set {speed_type} Speed:', reply_markup=reply_markup)

    @staticmethod
    async def show_signup_menu(message: Message) -> None:
        """Show the sign up menu"""
        keyboard = [
            [InlineKeyboardButton("Sign Up", callback_data='SIGN_UP')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await message.reply_text('Click on this button to register.', reply_markup=reply_markup)
