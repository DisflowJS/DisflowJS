/**
 * ℹ️ Info Command
 */

bot.command.new('info', 'Show bot information', async function() {
  await this.defer();
  
  await this.edit({
    embeds: [{
      title: `${this.emoji.info} Bot Information`,
      fields: [
        { name: 'Name', value: this.vals.bot.name, inline: true },
        { name: 'Ping', value: `${this.client.ws.ping}ms`, inline: true },
        { name: 'Servers', value: this.client.guilds.cache.size.toString(), inline: true }
      ],
      color: this.vals.colors.primary,
      footer: { text: 'Disflow Framework' }
    }]
  });
});
