/**
 * 📡 Event Handlers
 */

on('guildMemberAdd', async (member) => {
  await log(`${emoji.wave} **${member.user.tag}** joined!`);
});

on('guildMemberRemove', async (member) => {
  await log(`${emoji.cross} **${member.user.tag}** left.`);
});

console.log('✅ Events loaded!');
