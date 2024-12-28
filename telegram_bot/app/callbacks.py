import io
import asyncio
from PIL import Image
from pyzbar.pyzbar import decode

from telegram import Update, ChatMember
from telegram.ext import ContextTypes

from app.commands import Commands
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
        await Menus.show_main_menu(query.message)
    
    @staticmethod
    async def devices(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()

        telegram_id = query.from_user.id
        devices = await db.get_user_devices(telegram_id)
        await Menus.show_devices_menu(query.message, devices)

    @staticmethod
    async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
    
        telegram_id = query.from_user.id
        user_info = await db.get_user_info(telegram_id)

        if user_info:
            premium_status = 'Yes' if user_info['premium'] else 'No'
            message = (
                f"👤 *User Info:*\n"
                f"ID: `{user_info['telegramid']}`\n"
                f"Name: {user_info['name']}\n"
                f"Premium: {premium_status}\n"
                f"Joined At: {user_info['createdat']}\n"
            )
            await query.edit_message_text(message, parse_mode="Markdown")
        else:
            await query.edit_message_text("You are not registered. Use /start to register.")
        await Menus.show_profile_menu(query.message, premium_status)

    @staticmethod
    async def help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        pass

    @staticmethod
    async def back_to_main(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()

        await Commands.start(update, context, is_callback=True)
    
    @staticmethod
    async def device_selected(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        pass

    @staticmethod
    async def add_new_device(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
        await query.message.reply_text(
            "Please send the device serial number as text or send a photo of the QR code."
        )
        context.user_data['add_device_step'] = 'waiting_for_serial_or_qr'

    @staticmethod
    async def handle_serial_number(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if context.user_data.get('add_device_step') == 'waiting_for_serial_or_qr':
            serial_number = update.message.text.strip()
            context.user_data['serial_number'] = serial_number
            await Menus.confirm_device_registration(update.message, serial_number)
            
    @staticmethod
    async def handle_qr_code(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if context.user_data.get('add_device_step') == 'waiting_for_serial_or_qr':
            photo = await update.message.photo[-1].get_file()
            file_stream = io.BytesIO()
            await photo.download(out=file_stream)
            file_stream.seek(0)

            img = Image.open(file_stream)
            decoded = decode(img)
            if decoded:
                serial_number = decoded[0].data.decode("utf-8")
                context.user_data['serial_number'] = serial_number
                await Menus.confirm_device_registration(update.message, serial_number)
            else:
                await update.message.reply_text("Failed to decode the QR code. Please try again.")
                
    @staticmethod
    async def confirm_add_device(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()

        serial_number = context.user_data.get('serial_number')
        if not serial_number:
            await query.message.reply_text("Serial number not found. Please try again.")
            return

        # Publish MQTT message
        # mqtt_client.publish(f"device/{serial_number}/register", "START_REGISTRATION")
        # await query.message.reply_text(
        #     f"Waiting for confirmation from the device with serial number {serial_number}..."
        # )

        # Wait for confirmation with a timeout
        event = asyncio.Event()
        context.user_data['mqtt_event'] = event

        try:
            await asyncio.wait_for(event.wait(), timeout=30)
            await db.add_device(context.user_data['user_id'], serial_number)
            await query.message.reply_text("Device successfully added!")
        except asyncio.TimeoutError:
            await query.message.reply_text("Device registration timed out. Please try again.")
        finally:
            # Cleanup
            context.user_data.pop('mqtt_event', None)
            await Menus.show_devices_menu(query.message, await db.get_user_devices(context.user_data['user_id']))

    @staticmethod
    async def cancel_add_device(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
        await query.message.reply_text("Device registration cancelled.")
        await Menus.show_devices_menu(query.message, await db.get_user_devices(context.user_data['user_id']))
