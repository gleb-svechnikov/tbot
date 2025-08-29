const crypto = require('crypto');

// Configuration helper
const getConfig = () => ({
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    welcomeMessage: process.env.WELCOME_MESSAGE || 'Добро пожаловать! Я бот поддержки. Напишите ваш вопрос, и я передам его нашим специалистам.'
  },
  respondIo: {
    apiToken: process.env.RESPOND_IO_API_TOKEN,
    channelId: parseInt(process.env.RESPOND_IO_CHANNEL_ID, 10),
    baseUrl: process.env.RESPOND_IO_BASE_URL || 'https://api.respond.io'
  },
  webhook: {
    secretToken: process.env.TELEGRAM_SECRET_TOKEN
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

const getTelegramFile = async (botToken, fileId) => {
  try {
    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const url = new URL(`${baseUrl}/getFile`);
    url.searchParams.append('file_id', fileId);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error getting file from Telegram:', error.message);
    throw error;
  }
};

const downloadTelegramFile = async (botToken, filePath) => {
  try {
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading file from Telegram:', error.message);
    throw error;
  }
};

const answerCallbackQuery = async (botToken, callbackQueryId, text = '') => {
  try {
    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const response = await fetch(`${baseUrl}/answerCallbackQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error answering callback query:', error.message);
    throw error;
  }
};

// respond.io API functions
const sendRespondIOTextMessage = async (config, userId, text) => {
  // Try multiple respond.io API formats since the current one is not working
  try {
    console.log('RespondIO config:');
    console.log('- Channel ID:', config.respondIo.channelId, '(type:', typeof config.respondIo.channelId + ')');
    console.log('- Base URL:', config.respondIo.baseUrl);
    console.log('- Token length:', config.respondIo.apiToken.length);

    // Format 1: Try with numeric contactId
    const payload1 = {
      channelId: config.respondIo.channelId,
      contactId: parseInt(userId, 10), // Convert to number
      message: {
        type: 'text',
        text: text
      }
    };

    console.log('Attempt 1 - Numeric contactId:', JSON.stringify(payload1, null, 2));

    let response = await fetch(`${config.respondIo.baseUrl}/v2/contact/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.respondIo.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload1)
    });

    // Format 2: Try different payload structure
    if (!response.ok) {
      console.log('Attempt 1 failed, trying alternative structure...');
      
      const payload2 = {
        channelId: config.respondIo.channelId,
        contact: {
          id: userId
        },
        message: {
          type: 'text',
          text: text
        }
      };
      
      console.log('Attempt 2 - Contact object:', JSON.stringify(payload2, null, 2));
      
      response = await fetch(`${config.respondIo.baseUrl}/v2/contact/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.respondIo.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload2)
      });
    }

    // Format 3: Try simplified structure
    if (!response.ok) {
      console.log('Attempt 2 failed, trying simplified structure...');
      
      const payload3 = {
        channelId: config.respondIo.channelId,
        contactId: userId,
        type: 'text',
        text: text
      };
      
      console.log('Attempt 3 - Simplified:', JSON.stringify(payload3, null, 2));
      
      response = await fetch(`${config.respondIo.baseUrl}/v2/contact/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.respondIo.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload3)
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('All respond.io format attempts failed. Last error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Log debug info
      console.error('Debug info:');
      console.error('- Channel ID:', config.respondIo.channelId, '(type:', typeof config.respondIo.channelId + ')');
      console.error('- User ID:', userId, '(type:', typeof userId + ')');
      console.error('- User ID as number:', parseInt(userId, 10), '(type:', typeof parseInt(userId, 10) + ')');
      console.error('- API Token length:', config.respondIo.apiToken.length);
      console.error('- Base URL:', config.respondIo.baseUrl);
      
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log(`Text message sent to respond.io for user ${userId}:`, result);
    return result;
  } catch (error) {
    console.error('Error sending text message to respond.io:', error.message);
    throw error;
  }
};

const sendRespondIOMessage = async (config, userId, messageType, content) => {
  try {
    const payload = {
      channelId: config.respondIo.channelId,
      contactId: userId,
      message: {
        type: messageType,
        ...content
      }
    };

    console.log('Sending to respond.io:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${config.respondIo.baseUrl}/v2/contact/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.respondIo.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('respond.io API error:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    console.log(`Message sent to respond.io for user ${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error sending to respond.io:', error.message);
    throw error;
  }
};

const sendRespondIOMediaMessage = async (config, userId, mediaType, mediaUrl, caption = '') => {
  const content = { url: mediaUrl };
  if (caption) content.caption = caption;
  return await sendRespondIOMessage(config, userId, mediaType, content);
};

const uploadFileToRespondIO = async (config, fileBuffer, fileName, mimeType) => {
  try {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', blob, fileName);

    const response = await fetch(`${config.respondIo.baseUrl}/v2/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.respondIo.apiToken}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading file to respond.io:', error.message);
    throw error;
  }
};

// Utility functions
const verifyTelegramSignature = (body, signature, secretToken) => {
  if (!secretToken) return true;

  const secretKey = crypto.createHash('sha256')
    .update(secretToken)
    .digest();

  const hmac = crypto.createHmac('sha256', secretKey)
    .update(body)
    .digest('hex');

  return `sha256=${hmac}` === signature;
};

const getMimeType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'mp4': 'video/mp4',
    'avi': 'video/avi',
    'mov': 'video/quicktime',
    'ogg': 'audio/ogg',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

const getMediaTypeRussian = (mediaType) => {
  const translations = {
    'photo': 'изображения',
    'document': 'документа',
    'video': 'видео',
    'voice': 'голосового сообщения',
    'audio': 'голосового сообщения',
    'sticker': 'стикера'
  };
  return translations[mediaType] || 'файла';
};

// Bot command handlers
const handleStartCommand = async (config, chatId) => {
  try {
    // Создаем inline клавиатуру с кнопками Да/Нет
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Да', callback_data: 'yes' },
            { text: 'Нет', callback_data: 'no' }
          ]
        ]
      }
    };

    await sendTelegramMessage(
      config.telegram.botToken,
      chatId, 
      config.telegram.welcomeMessage,
      inlineKeyboard
    );
    console.log(`Welcome message with buttons sent to user ${chatId}`);
  } catch (error) {
    console.error('Error handling /start command:', error.message);
    await sendTelegramMessage(config.telegram.botToken, chatId, 'Произошла ошибка. Попробуйте позже.');
  }
};

const handleTextMessage = async (config, message) => {
  try {
    const userId = message.from.id.toString();
    const text = message.text;
    
    console.log(`Processing text message from user ${userId}: "${text}"`);
    console.log('User info:', JSON.stringify(message.from, null, 2));
    console.log('Chat info:', JSON.stringify(message.chat, null, 2));

    await sendRespondIOTextMessage(config, userId, text);
    console.log(`Text message from ${userId} successfully forwarded to respond.io`);
  } catch (error) {
    console.error('Error handling text message:', error.message);
    console.error('Full error:', error);
    
    // More specific error message for debugging
    let errorMessage = 'Извините, не удалось обработать ваше сообщение. Попробуйте позже.';
    if (error.message.includes('400')) {
      errorMessage = 'Ошибка формата сообщения. Разработчики уведомлены.';
    } else if (error.message.includes('401')) {
      errorMessage = 'Ошибка авторизации. Разработчики уведомлены.';
    }
    
    await sendTelegramMessage(config.telegram.botToken, message.chat.id, errorMessage);
  }
};

const handleMediaMessage = async (config, message, mediaType) => {
  try {
    const userId = message.from.id.toString();
    let fileId, fileName, caption;

    switch (mediaType) {
      case 'photo':
        fileId = message.photo[message.photo.length - 1].file_id;
        fileName = `photo_${Date.now()}.jpg`;
        caption = message.caption || '';
        break;
      case 'document':
        fileId = message.document.file_id;
        fileName = message.document.file_name || `document_${Date.now()}`;
        caption = message.caption || '';
        break;
      case 'video':
        fileId = message.video.file_id;
        fileName = `video_${Date.now()}.mp4`;
        caption = message.caption || '';
        break;
      case 'voice':
        fileId = message.voice.file_id;
        fileName = `voice_${Date.now()}.ogg`;
        mediaType = 'audio';
        break;
      case 'sticker':
        fileId = message.sticker.file_id;
        fileName = `sticker_${Date.now()}.webp`;
        break;
      default:
        throw new Error(`Unsupported media type: ${mediaType}`);
    }

    const file = await getTelegramFile(config.telegram.botToken, fileId);
    const fileBuffer = await downloadTelegramFile(config.telegram.botToken, file.file_path);

    const mimeType = getMimeType(fileName);

    const mediaUrl = await uploadFileToRespondIO(config, fileBuffer, fileName, mimeType);

    await sendRespondIOMediaMessage(config, userId, mediaType, mediaUrl, caption);

    console.log(`${mediaType} from ${userId} forwarded to respond.io`);
  } catch (error) {
    console.error(`Error handling ${mediaType} message:`, error.message);
    await sendTelegramMessage(config.telegram.botToken, message.chat.id, `Произошла ошибка при обработке ${getMediaTypeRussian(mediaType)}.`);
  }
};

// Обработка callback queries (нажатий на inline кнопки)
const handleCallbackQuery = async (config, callbackQuery) => {
  try {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;
    
    let responseText = '';
    
    if (data === 'yes') {
      responseText = 'Спасибо! Теперь вы можете написать ваш вопрос, и я передам его нашим специалистам.';
      // Отправляем информацию о выборе в respond.io
      await sendRespondIOTextMessage(config, userId, 'Пользователь выбрал: Да');
    } else if (data === 'no') {
      responseText = 'Понятно. Если передумаете, просто напишите /start снова.';
      // Отправляем информацию о выборе в respond.io
      await sendRespondIOTextMessage(config, userId, 'Пользователь выбрал: Нет');
    }
    
    // Отвечаем на callback query
    await answerCallbackQuery(config.telegram.botToken, callbackQuery.id, responseText);
    
    // Отправляем сообщение пользователю
    await sendTelegramMessage(config.telegram.botToken, chatId, responseText);
    
    console.log(`Callback query '${data}' handled for user ${userId}`);
  } catch (error) {
    console.error('Error handling callback query:', error.message);
    await answerCallbackQuery(config.telegram.botToken, callbackQuery.id, 'Произошла ошибка');
  }
};

const handleUpdate = async (config, update) => {
  try {
    // Обработка callback queries (нажатий на кнопки)
    if (update.callback_query) {
      await handleCallbackQuery(config, update.callback_query);
      return;
    }
    
    if (!update.message) return;

    const message = update.message;

    if (message.text && message.text.startsWith('/')) {
      if (message.text === '/start') {
        await handleStartCommand(config, message.chat.id);
      }
      return;
    }

    if (message.text) {
      await handleTextMessage(config, message);
    } else if (message.photo) {
      await handleMediaMessage(config, message, 'photo');
    } else if (message.document) {
      await handleMediaMessage(config, message, 'document');
    } else if (message.video) {
      await handleMediaMessage(config, message, 'video');
    } else if (message.voice) {
      await handleMediaMessage(config, message, 'voice');
    } else if (message.sticker) {
      await handleMediaMessage(config, message, 'sticker');
    }
  } catch (error) {
    console.error('Error handling update:', error.message);
  }
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const config = getConfig();
    
    if (!config.telegram.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }

    const signature = event.headers['x-telegram-bot-api-secret-token'];
    if (!verifyTelegramSignature(event.body, signature, config.webhook.secretToken)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    const update = JSON.parse(event.body);

    await handleUpdate(config, update);

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