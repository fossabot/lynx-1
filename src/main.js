const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const token = process.env.TGBOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// import logger and blocklist
const logMessage = require('./logger');
const { isBlocked } = require('./blocklist');

const commandsPath = path.join(__dirname, 'commands');
const commandHandlers = {};

fs.readdirSync(commandsPath).forEach(file => {
  const command = `/${path.parse(file).name}`;
  const handler = require(path.join(commandsPath, file));
  commandHandlers[command] = handler;
});

bot.on('message', (msg) => {
  const userId = msg.from.id;

  if (isBlocked(userId)) {
    console.log(`WARN: Blocked user ${userId} tried to access the bot.`);
    return;
  }

  const messageText = msg.text;
  if (commandHandlers[messageText]) {
    commandHandlers[messageText](bot, msg);
  }
});

bot.on('polling_error', (error) => {
  console.error('WARN: Polling error:', error);
});

const date = new Date().toString();
console.log(`INFO: Lynx started\n`);
