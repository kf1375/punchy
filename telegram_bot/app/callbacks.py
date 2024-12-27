from telegram import Update, ChatMember
from telegram.ext import ContextTypes

from app.menus import Menus
from app.database import db

class Callbacks:
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

    @staticmethod
    async def sign_up(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
        
        telegram_id = query.from_user.id
        name = query.from_user.full_name

        exists = await db.user_exists(telegram_id)
        if not exists:
            await db.add_user(telegram_id, name)
            await query.edit_message_text('You are successfully registered!')
        else:
            await query.edit_message_text('You are already registered!')
    
    @staticmethod
    async def chat_member_update(update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_member = update.chat_member
        if chat_member.new_chat_member.status in [ChatMember.LEFT, ChatMember.KICKED]:
            telegram_id = chat_member.user.id
            print(f"User {telegram_id} has left or blocked the bot and was removed from the database.")