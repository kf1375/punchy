from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Message, Update
from telegram.ext import ContextTypes

class Menus:
    """Class to manage bot menus and buttons."""

    @staticmethod
    async def show_main_menu(message: Message) -> None:
        """Show the main menu with motor control options."""
        keyboard = [
            [InlineKeyboardButton('Devices', callback_data='DEVICES')],
            [InlineKeyboardButton('Profile', callback_data='PROFILE')],
            [InlineKeyboardButton('Help', callback_data='HELP')],
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

    @staticmethod
    async def show_profile_menu(message: Message, premium_status: str) -> None:
        if premium_status == 'No':
            keyboard = [
                [InlineKeyboardButton('Get Premium', callback_data='GET_SUBSCRIPTION')],
                [InlineKeyboardButton('Back', callback_data='BACK_TO_MAIN')],
            ]
        else:
            keyboard = [
                [InlineKeyboardButton('Back', callback_data='BACK_TO_MAIN')],
            ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await message.reply_text('Please choose:', reply_markup=reply_markup)


    @staticmethod
    async def show_devices_menu(message: Message, devices: list) -> None:
        """Display a menu with the user's devices and an option to add a new device."""
        keyboard = [
            [InlineKeyboardButton(device['device_name'], callback_data=f"DEVICE_{device['device_id']}")]
            for device in devices
        ]
        
        keyboard.append([InlineKeyboardButton("Add New Device", callback_data="ADD_NEW_DEVICE")])
        reply_markup = InlineKeyboardMarkup(keyboard)
        await message.reply_text("Please choose a device or add a new one:", reply_markup=reply_markup)

    @staticmethod
    async def show_help_menu(message: Message) -> None:
        pass