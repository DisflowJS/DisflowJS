/**
 * ❓ Help Command
 */

bot.command.new('help', 'Show help menu', async function() {
  const commands = this.getCommands();
  const list = commands.map(cmd => `• \`/${cmd.name}\` - ${cmd.description}`).join('\n');
  
  await this.reply({
    embeds: [{
      title: `${this.emoji.info} Help`,
      description: `**Commands:**\n${list}`,
      color: this.vals.colors.primary,
      footer: { text: this.vals.bot.name }
    }]
  });
});
