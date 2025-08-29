const crypto = require('crypto');

// Configuration helper
const getConfig = () => ({
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  respondIo: {
    apiToken: process.env.RESPOND_IO_API_TOKEN,
    channelId: process.env.RESPOND_IO_CHANNEL_ID,
    baseUrl: process.env.RESPOND_IO_BASE_URL || 'https://api.respond.io'
  },
  webhook: {
    secretToken: process.env.RESPOND_IO_WEBHOOK_SECRET 
  }
});

// Telegram API functions
const sendTelegramMessage = async (botToken, chatId, text, options = {}) => {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: options.parseMode || 'HTML',
      ...options
    };

    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const response = await fetch(`${baseUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
    throw error;
  }
};

const sendTelegramPhoto = async (botToken, chatId, photoUrl, caption = '', options = {}) => {
  try {
    const payload = {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: options.parseMode || 'HTML',
      ...options
    };

    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const response = await fetch(`${baseUrl}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending photo:', error.message);
    throw error;
  }
};

const sendTelegramDocument = async (botToken, chatId, documentUrl, caption = '', options = {}) => {
  try {
    const payload = {
      chat_id: chatId,
      document: documentUrl,
      caption: caption,
      parse_mode: options.parseMode || 'HTML',
      ...options
    };

    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const response = await fetch(`${baseUrl}/sendDocument`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending document:', error.message);
    throw error;
  }
};

const sendTelegramVideo = async (botToken, chatId, videoUrl, caption = '', options = {}) => {
  try {
    const payload = {
      chat_id: chatId,
      video: videoUrl,
      caption: caption,
      parse_mode: options.parseMode || 'HTML',
      ...options
    };

    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const response = await fetch(`${baseUrl}/sendVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending video:', error.message);
    throw error;
  }
};

const sendTelegramAudio = async (botToken, chatId, audioUrl, caption = '', options = {}) => {
  try {
    const payload = {
      chat_id: chatId,
      audio: audioUrl,
      caption: caption,
      parse_mode: options.parseMode || 'HTML',
      ...options
    };

    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const response = await fetch(`${baseUrl}/sendAudio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending audio:', error.message);
    throw error;
  }
};

// Utility functions
const verifyRespondIOSignature = (body, signature, secretToken) => {
  if (!secretToken) return true; // Если секретный токен не установлен

  // Здесь должна быть логика проверки подписи от respond.io
  // В зависимости от того, как respond.io подписывает webhooks
  return true; // Пока упрощенно
};

// Message handling functions
const handleIncomingMessage = async (config, message) => {
  try {
    const chatId = message.contactId; // ID пользователя Telegram
    const messageType = message.type;

    console.log(`Processing message from respond.io for user ${chatId}, type: ${messageType}`);

    switch (messageType) {
      case 'text':
        await sendTelegramMessage(config.telegram.botToken, chatId, message.text);
        break;
      
      case 'image':
        await sendTelegramPhoto(config.telegram.botToken, chatId, message.url, message.caption || '');
        break;
      
      case 'document':
        await sendTelegramDocument(config.telegram.botToken, chatId, message.url, message.caption || '');
        break;
      
      case 'video':
        await sendTelegramVideo(config.telegram.botToken, chatId, message.url, message.caption || '');
        break;
      
      case 'audio':
        await sendTelegramAudio(config.telegram.botToken, chatId, message.url, message.caption || '');
        break;
      
      default:
        console.warn(`Unsupported message type from respond.io: ${messageType}`);
        // Если тип не поддерживается, отправляем как текст
        await sendTelegramMessage(config.telegram.botToken, chatId, message.text || 'Сообщение от поддержки');
    }

    console.log(`Message delivered to Telegram user ${chatId}`);
  } catch (error) {
    console.error('Error handling message from respond.io:', error.message);
    throw error;
  }
};

const handleRespondIOWebhook = async (config, webhookData) => {
  try {
    // respond.io может отправлять разные типы событий
    if (webhookData.event === 'message' && webhookData.message) {
      await handleIncomingMessage(config, webhookData.message);
    } else {
      console.log('Received non-message event from respond.io:', webhookData.event);
    }
  } catch (error) {
    console.error('Error processing respond.io webhook:', error.message);
    throw error;
  }
};

// Netlify Function handler для respond.io webhook
exports.handler = async (event, context) => {
  // Проверяем метод запроса
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const config = getConfig();
    
    // Проверяем наличие обязательных переменных окружения
    if (!config.telegram.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }

    // Проверяем подпись webhook (если настроена)
    const signature = event.headers['x-signature'] || event.headers['authorization'];
    if (!verifyRespondIOSignature(event.body, signature, config.webhook.secretToken)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Парсим тело запроса
    const webhookData = JSON.parse(event.body);

    // Обрабатываем webhook
    await handleRespondIOWebhook(config, webhookData);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Function error:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};