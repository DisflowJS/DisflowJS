/**
 * 👋 Hello Command
 */

bot.command.new('hello', 'Greet users', async function() {
  await this.reply(`${this.emoji.wave} Hello Bro, **${this.user.username}**!`);
});
