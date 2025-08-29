# Инструкция по настройке Telegram Bot с Respond.io

## Обзор функций

Этот проект реализует Telegram-бота с полной интеграцией respond.io, включающий:

**Команда /start** с кнопками "Да/Нет"
**Двусторонняя связь** между Telegram и respond.io
**Поддержка всех типов медиа** (текст, фото, видео, документы, голосовые, стикеры)
**Готов для деплоя на Netlify**

## Быстрый старт

### 1. Получение токенов

**Telegram Bot Token:**

1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Скопируйте полученный токен

**Respond.io API Token и Channel ID:**

1. Войдите в [respond.io dashboard](https://app.respond.io/)
2. Перейдите в Settings → API
3. Создайте новый API token
4. Найдите Channel ID в настройках канала

### 2. Настройка переменных окружения

Заполните файл `.env` на основе `.env.example`:

```bash
# Обязательные переменные
TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789
RESPOND_IO_API_TOKEN=rp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESPOND_IO_CHANNEL_ID=12345

# Опциональные переменные
WELCOME_MESSAGE=Welcome! I'm a support bot. Write your question and I'll forward it to our specialists.
TELEGRAM_SECRET_TOKEN=my_super_secret_webhook_token_123
RESPOND_IO_WEBHOOK_SECRET=my_super_secret_respond_io_webhook_token_456
```

### 3. Деплой на Netlify

1. **Подключите репозиторий:**

   - Загрузите код в GitHub
   - Подключите репозиторий к Netlify

2. **Настройте environment variables в Netlify:**

   - Перейдите в Site settings → Environment variables
   - Добавьте все переменные из `.env` файла

3. **Deploy:**
   - Netlify автоматически задеплоит проект
   - Получите URL вашего сайта (например: `https://your-bot.netlify.app`)

### 4. Настройка Webhooks

**Telegram Webhook:**

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-bot.netlify.app/.netlify/functions/telegram-bot",
    "secret_token": "your_secret_token_here"
  }'
```

**Respond.io Webhook:**

1. В respond.io dashboard перейдите в Settings → Webhooks
2. Добавьте новый webhook:
   - URL: `https://your-bot.netlify.app/.netlify/functions/respond-io-webhook`
   - Events: Выберите события для сообщений
   - Secret (опционально): Значение из `RESPOND_IO_WEBHOOK_SECRET`


## Endpoints

1. **Telegram Webhook:** `/.netlify/functions/telegram-bot`

   - Принимает сообщения от Telegram
   - Пересылает их в respond.io

2. **Respond.io Webhook:** `/.netlify/functions/respond-io-webhook`
   - Принимает ответы от respond.io
   - Отправляет их в Telegram

## Поток сообщений

### Incoming (Telegram → respond.io):

1. Пользователь пишет боту
2. Telegram отправляет webhook на `/telegram-bot`
3. Бот пересылает сообщение в respond.io
4. Специалист видит сообщение в respond.io

### Outgoing (respond.io → Telegram):

1. Специалист отвечает в respond.io
2. respond.io отправляет webhook на `/respond-io-webhook`
3. Система отправляет ответ пользователю в Telegram

## Поддерживаемые типы сообщений

**Входящие (Telegram → respond.io):**

- Текстовые сообщения
- Фотографии
- Видео
- Документы
- Голосовые сообщения
- Стикеры

**Исходящие (respond.io → Telegram):**

- Текстовые сообщения
- Фотографии
- Видео
- Документы
- Аудио

## Безопасность

- Используются secret tokens для проверки webhooks
- Все переменные окружения защищены
- HTTPS обязателен для webhooks

## Troubleshooting

**Бот не отвечает:**

1. Проверьте webhook URL: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Убедитесь, что все environment variables установлены
3. Проверьте логи в Netlify Functions

**Сообщения не пересылаются:**

1. Проверьте правильность API токенов
2. Убедитесь, что Channel ID корректный
3. Проверьте настройки webhooks в respond.io

**Ошибки деплоя:**

1. Убедитесь, что нет синтаксических ошибок
2. Проверьте, что все файлы находятся в правильных папках
3. Убедитесь, что package.json корректный
