const { getStrings } = require('../plugins/checklang.js');
const { isOnSpamWatch } = require('../plugins/lib-spamwatch/spamwatch.js');
const spamwatchMiddleware = require('../plugins/lib-spamwatch/Middleware.js')(isOnSpamWatch);
const axios = require('axios');

module.exports = (bot) => {
  bot.command("http", spamwatchMiddleware, async (ctx) => {
    const Strings = getStrings(ctx.from.language_code);
    const userInput = ctx.message.text.split(' ')[1];
    const apiUrl = "https://status.js.org/codes.json";

    if (!userInput || isNaN(userInput)) {
      return ctx.reply(Strings.httpCodeInvalid, {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message.message_id
      });
    };

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;
      const codesArray = Array.isArray(data) ? data : Object.values(data);
      const codeInfo = codesArray.find(item => item.code === parseInt(userInput));

      if (codeInfo) {
        const message = Strings.httpCodeResult
          .replace("{code}", codeInfo.code)
          .replace("{description}", codeInfo.description);
        await ctx.reply(message, {
          parse_mode: 'Markdown',
          reply_to_message_id: ctx.message.message_id
        });
      } else {
        await ctx.reply(Strings.httpCodeNotFound, {
          parse_mode: 'Markdown',
          reply_to_message_id: ctx.message.message_id
        });
      };
    } catch (error) {
      const message = Strings.httpCodeErr.replace("{error}", error);
      ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_to_message_id: ctx.message.message_id
      });
    };
  });
};