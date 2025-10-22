/**
 * 🎨 Button Templates
 */

flow.button.template('confirm')
  .title('Accept')
  .emoji('✅')
  .color('Success')
  .clickEvent(async function() {
    await this.update({ content: 'Successfully confirmed!', components: [] });
  });

flow.button.template('cancel')
  .title('Decline')
  .emoji('❌')
  .color('Danger')
  .clickEvent(async function() {
    await this.update({ content: 'Declined.', components: [] });
  });

console.log('✅ Button templates loaded!');
