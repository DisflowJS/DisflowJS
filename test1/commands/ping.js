/**
 * 🏓 Ping Command
 */

bot.command.new('ping', 'Check bot latency', async function() {
  await this.defer();
  
  const ping = this.client.ws.ping;
  await this.edit(`${this.emoji.rocket} Pong! **${ping}ms**`);
});
