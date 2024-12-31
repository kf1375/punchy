import io
import asyncio
import json
from datetime import datetime, timedelta
from PIL import Image
from pyzbar.pyzbar import decode

from telegram import Update, ChatMember
from telegram.ext import ContextTypes

from app.commands import Commands
from app.menus import Menus
from app.database import db
from app.mqtt_client import mqttClient
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
        
        user_telegram_id = query.from_user.id
        name = query.from_user.full_name

        exists = await db.user_exists(user_telegram_id)
        if not exists:
            await db.add_user(user_telegram_id, name)
            await query.edit_message_text('You are successfully registered!')
        else:
            await query.edit_message_text('You are already registered!')
        await Menus.show_main_menu(query.message)
    
    @staticmethod
    async def devices(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()

        user_telegram_id = query.from_user.id
        devices = await db.get_user_devices(user_telegram_id)
        await Menus.show_devices_menu(query.message, devices)

    @staticmethod
    async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()
    
        user_telegram_id = query.from_user.id
        user = await db.get_user_by_telegram_id(user_telegram_id)

        if user:
            subscription_type = 'Yes' if user['subscription_type'] else 'No'
            message = (
                f"👤 *User Info:*\n"
                f"ID: `{user['telegram_id']}`\n"
                f"Name: {user['name']}\n"
                f"Premium: {subscription_type}\n"
                f"Joined At: {user['created_at']}\n"
            )
            await query.edit_message_text(message, parse_mode="Markdown")
        else:
            await query.edit_message_text("You are not registered. Use /start to register.")
        await Menus.show_profile_menu(query.message, subscription_type)

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
            file_stream = io.BytesIO(await photo.download_as_bytearray())
            file_stream.seek(0)

            img = Image.open(file_stream)

            # Log the image size or any relevant info
            print(f"Image size: {img.size}")
            
            decoded = decode(img)
            if decoded:
                serial_number = decoded[0].data.decode("utf-8")
                context.user_data['serial_number'] = serial_number
                await Menus.confirm_device_registration(update.message, serial_number)
            else:
                await update.message.reply_photo(photo=file_stream, caption="failed")
                
    @staticmethod
    async def confirm_add_device(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()

        user_telegram_id = context.user_data.get('user_id')
        device_serial_number = context.user_data.get('serial_number')

        if not device_serial_number:
            await query.message.reply_text("Serial number not found. Please try again.")
            return

        await query.message.reply_text(f'Sending registration request for device with serial number {device_serial_number}...')
        
        # Publish MQTT message
        # Callback to handle the device's response to the pairing request
        async def handle_device_response(topic, payload):
            try:
                data = json.loads(payload)
                if data.get("type") == "response" and data.get("status"):
                    if data["status"] == "accepted":
                        # Device confirmed, add the device to the database
                        await db.add_device(user_telegram_id, device_serial_number, f"Device {device_serial_number}")
                        print("Device accepted")
                        return True
                    elif data["status"] == "rejected":
                        # Handle rejection (e.g., show reason to the user)
                        print(f"Device rejected: {data.get('message')}")
                        return False
            except Exception as e:
                print(f"Error processing message: {e}")
            return False

        request_payload = {
            "type": "request"
        }

        pairing_topic = f"{device_serial_number}/pair"
        await mqttClient.subscribe(pairing_topic, handle_device_response)
        await mqttClient.publish(pairing_topic, request_payload)

        # Wait for the confirmation or timeout (30 seconds)
        start_time = datetime.now()
        while datetime.now() - start_time < timedelta(seconds=30):
            await asyncio.sleep(1)  # Keep the loop running to check for messages

        # If no confirmation received in 30 seconds, handle the timeout
        await mqttClient.cancel_callback(pairing_topic, handle_device_response)
        print("Timeout waiting for device response.")

        await Menus.show_devices_menu(query.message, await db.get_user_devices(user_telegram_id))

    @staticmethod
    async def cancel_add_device(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        query = update.callback_query
        await query.answer()

        user_telegram_id = context.user_data.get('user_id')
        await query.message.reply_text("Device registration cancelled.")
        await Menus.show_devices_menu(query.message, await db.get_user_devices(user_telegram_id))
