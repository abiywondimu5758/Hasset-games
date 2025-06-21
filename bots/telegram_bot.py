import os
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from aiogram.filters import CommandStart
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(
    filename="telebot.logs",
    level=logging.INFO,  # Change to DEBUG if needed
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logging.info("Bot is starting...")

try:
    # Load environment variables
    load_dotenv()
    TOKEN = os.getenv("TELE_BOT_TOKEN")

    # Initialize bot and dispatcher
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    print("✅ Waiting for bot interaction...")  # Prints to show the bot is running without errors

    @dp.message(CommandStart())  
    async def start(message: types.Message):
        keyboard = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="Play", web_app=WebAppInfo(url="https://hasetgames.com"))]],
            resize_keyboard=True
        )
        
        await message.answer("Welcome to Fortune Bets Bingo \nእንኳን ወደ ፎርቹን ቤትስ ቢንጐ በሰላም መጡ", reply_markup=keyboard)

    async def main():
        await dp.start_polling(bot)

    if __name__ == "__main__":
        asyncio.run(main())
    logging.info("Bot is running...")
except Exception as e:
    logging.error(f"Error occurred: {e}", exc_info=True)
