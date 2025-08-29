// Скрипт для настройки Telegram webhook
try {
  require('dotenv').config();
} catch (e) {
  // dotenv не установлен - это нормально для production
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN;
const NETLIFY_URL = process.env.NETLIFY_URL;

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN не найден в переменных окружения');
  process.exit(1);
}

async function setWebhook() {
  try {
    const webhookUrl = `${NETLIFY_URL}/.netlify/functions/telegram-bot`;
    
    console.log('Настройка Telegram webhook...');
    console.log(`URL: ${webhookUrl}`);
    
    const payload = {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query']
    };
    
    if (SECRET_TOKEN) {
      payload.secret_token = SECRET_TOKEN;
      console.log('Secret token добавлен для безопасности');
    }
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('Webhook успешно настроен!');
      console.log(`Описание: ${result.description}`);
    } else {
      console.error('Ошибка при настройке webhook:', result.description);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

async function getWebhookInfo() {
  try {
    console.log('\nИнформация о текущем webhook:');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const result = await response.json();
    
    if (result.ok) {
      const info = result.result;
      console.log(`URL: ${info.url || 'не установлен'}`);
      console.log(`Количество ожидающих обновлений: ${info.pending_update_count}`);
      
      if (info.last_error_message) {
        console.log(`Последняя ошибка: ${info.last_error_message}`);
      }
    } else {
      console.error('Ошибка при получении информации о webhook:', result.description);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️ Удаление webhook...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('Webhook успешно удален!');
    } else {
      console.error('Ошибка при удалении webhook:', result.description);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

// Обработка аргументов командной строки
const command = process.argv[2];

switch (command) {
  case 'set':
    setWebhook();
    break;
  case 'info':
    getWebhookInfo();
    break;
  case 'delete':
    deleteWebhook();
    break;
  default:
    console.log(`
🔧 Утилита настройки Telegram webhook

Использование:
  npm run setup-webhook set     # Установить webhook
  npm run setup-webhook info    # Получить информацию о webhook
  npm run setup-webhook delete  # Удалить webhook

Переменные окружения:
  TELEGRAM_BOT_TOKEN     - Токен бота (обязательно)
  TELEGRAM_SECRET_TOKEN  - Секретный токен (опционально)
  NETLIFY_URL           - URL вашего сайта на Netlify

Пример:
  NETLIFY_URL=https://your-bot.netlify.app npm run setup-webhook set
`);
    break;
}