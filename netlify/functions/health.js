// Health check endpoint for browser testing
exports.handler = async (event, context) => {
  const timestamp = new Date().toISOString();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: timestamp,
      message: 'Telegram Bot is deployed and ready!',
      endpoints: {
        'telegram-webhook': 'https://tbot-georgia.netlify.app/.netlify/functions/telegram-bot',
        'respondio-webhook': 'https://tbot-georgia.netlify.app/.netlify/functions/respond-io-webhook'
      },
      environment: {
        'telegram-bot-configured': !!process.env.TELEGRAM_BOT_TOKEN,
        'respondio-api-configured': !!process.env.RESPOND_IO_API_TOKEN,
        'respondio-channel-configured': !!process.env.RESPOND_IO_CHANNEL_ID
      }
    })
  };
};