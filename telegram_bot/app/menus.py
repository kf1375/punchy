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
        await message.reply_text('Hi', reply_markup=reply_markup)

    @staticmethod    
    async def button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Handle button clicks."""
        query = update.callback_query
        await query.answer()

        if query.data in ['START_SINGLE', 'START_INFINITE', 'STOP_INFINITE']:
            # payload = json.dumps({"state": query.data})
            # mqtt_client.publish(MQTT_TOPIC_STATE, payload)
            await query.edit_message_text(text=f"Motor state set to {query.data}")
            await Menus.show_main_menu(query.message)

        elif query.data == 'SET_SINGLE_SPEED':
            context.user_data['speed_type'] = 'SINGLE_SPEED'
            await Menus.show_speed_menu(query.message, 'Single')

        elif query.data == 'SET_INFINITE_SPEED':
            context.user_data['speed_type'] = 'INFINITE_SPEED'
            await Menus.show_speed_menu(query.message, 'Infinite')

        elif query.data == 'BACK_TO_MAIN':
            await Menus.show_main_menu(query.message)
        
        elif query.data.startswith('INC_') or query.data.startswith('DEC_'):
            speed_type_key = context.user_data.get('speed_type')
            speed_change = 10 if 'INC_' in query.data else -10
            # Logic to adjust the speed by increment or decrement
            current_speed = context.user_data.get(speed_type_key, 0)  # Retrieve current speed from context
            new_speed = max(0, current_speed + speed_change)  # Ensure the speed doesn't go below 0
            context.user_data[speed_type_key] = new_speed  # Save new speed

            # Send speed update to MQTT
            # payload = json.dumps({"type": speed_type_key, "speed": new_speed})
            # mqtt_client.publish(MQTT_TOPIC_SPEED, payload)
            await query.edit_message_text(text=f'{speed_type_key} speed adjusted to {new_speed}')
            await Menus.show_speed_menu(query.message, speed_type_key.split('_')[0].capitalize())
