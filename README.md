# Telegram Bot with Respond.io Integration

Профессиональный Telegram-бот с полной интеграцией respond.io для организации службы поддержки.

## Возможности

- **Команда /start** с интерактивными кнопками "Да/Нет"
- **Двусторонняя интеграция** с respond.io
- 📎 **Поддержка всех типов медиа** (текст, фото, видео, документы, голосовые, стикеры)
- **Готов для деплоя на Netlify**
- **Безопасные webhooks** с проверкой подписи

## Архитектура

```
Telegram User ←→ Telegram Bot ←→ respond.io ←→ Support Agent
```

- **Входящие сообщения:** Telegram → respond.io
- **Исходящие ответы:** respond.io → Telegram

## Быстрый старт

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd tbot
   ```

2. **Настройте переменные окружения:**
   ```bash
   cp .env.example .env
   # Заполните .env файл своими токенами
   ```

3. **Задеплойте на Netlify:**
   - Подключите репозиторий к Netlify
   - Добавьте переменные окружения в настройках сайта
   - Настройте webhooks

**Подробная инструкция:** См. [SETUP.md](SETUP.md)

## 📁 Структура проекта

```
├── netlify/functions/
│   ├── telegram-bot.js          # Основной бот (Telegram → respond.io)
│   └── respond-io-webhook.js    # Обработчик ответов (respond.io → Telegram)
├── .env                         # Переменные окружения (создать из .env.example)
├── .env.example                 # Шаблон переменных
├── package.json                 # Зависимости проекта
├── SETUP.md                     # Подробная инструкция по настройке
└── README.md                    # Этот файл
```

## Требуемые переменные окружения

```bash
# Обязательные
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
RESPOND_IO_API_TOKEN=your_respond_io_api_token
RESPOND_IO_CHANNEL_ID=your_channel_id

# Опциональные
WELCOME_MESSAGE=Custom welcome message
TELEGRAM_SECRET_TOKEN=webhook_secret
RESPOND_IO_WEBHOOK_SECRET=respond_io_webhook_secret
```

## Endpoints

- **Telegram Webhook:** `/.netlify/functions/telegram-bot`
- **Respond.io Webhook:** `/.netlify/functions/respond-io-webhook`

## Технологии

- **Runtime:** Node.js
- **Platform:** Netlify Functions (Serverless)
- **HTTP Client:** Native fetch API
- **APIs:** Telegram Bot API, Respond.io API


