# 🌊 Disflow

**The easiest Discord bot framework**

End the chaos — just use `/commands`.

```javascript
// Every command in its own file — just bot.command.new()

// commands/ping.js
bot.command.new('ping', 'Pong!', async function() {
  await this.reply('Pong!');
});

// index.js
import { createBot } from 'disflow';
await createBot();
```

## 🚀 Quick Start

```bash
# 1. Create a bot
npx create-disflow my-bot

# 2. Run it
cd my-bot
npm start
```

## ✨ Features

- **Zero Config** — Just write a command and run
- **Simple Usage** — Define commands with `bot.command.new()`
- **Auto Deploy** — Slash commands automatically register
- **Hot Reload** — Commands auto-reload on file changes
- **Buttons** — Interactive buttons made easy
- **Embeds** — Rich message support
- **Events** — Full Discord event system
- **Utils** — Random, time, emoji, and more
- **Auto Logging** — Built-in logging system
- **Server Stats** — Easy access to server metrics
- **Flexible Loader** — Commands can live in nested folders and multiple module formats

## 📝 Command Syntax

```javascript
// commands/ping.js
bot.command.new('ping', 'Pong!', async function() {
  await this.reply('Pong!');
});
```

### With Parameters

```javascript
bot.command.new('greet', 'Greet someone', async function() {
  const user = this.getUser('user');
  await this.reply(`Hello, ${user.username}!`);
}, [{
  name: 'user',
  description: 'User to greet',
  type: 6,
  required: false
}]);
```

### With Buttons

```javascript
bot.command.new('menu', 'Show menu', async function() {
  await this.reply({
    embeds: [{ title: 'Menu', description: 'Choose an option:' }],
    components: [
      row(
        button('opt_1', 'Option 1', 'Primary'),
        button('opt_2', 'Option 2', 'Success')
      )
    ]
  });
});

onButton('opt_1', async function() {
  await this.update({ content: 'Option 1 selected!', components: [] });
});
```

## 📁 Project Structure

```
my-bot/
├── index.js              # Entry point
├── commands/             # Commands
│   ├── ping.js
│   ├── hello.js
│   └── ...
├── emoji/
│   └── emoji.js          # Emoji library
├── vals/
│   └── values.js         # Global constants
├── utils/
│   ├── button-template.js
│   ├── metrics.js          # Server stats
│   ├── random.js         # Random utilities
│   └── time.js           # Time utilities
├── .env                  # Bot token
└── package.json
```

## 🔥 Examples

### Dice Command

```javascript
// commands/dice.js
bot.command.new('dice', 'Roll a dice', async function() {
  const number = this.random.number(1, 6);
  await this.reply(`🎲 You rolled ${number}!`);
});
```

### Info Command

```javascript
// commands/info.js
bot.command.new('info', 'Bot info', async function() {
  await this.reply({
    embeds: [{
      title: 'Bot Info',
      fields: [
        { name: 'Ping', value: `${this.client.ws.ping}ms` },
        { name: 'Servers', value: this.client.guilds.cache.size }
      ]
    }]
  });
});
```

### Vote Command

```javascript
// commands/vote.js
bot.command.new('vote', 'Create a vote', async function() {
  await this.reply({
    embeds: [{ title: '📊 Vote', description: 'Cast your vote!' }],
    components: [
      row(
        button('yes', '✅ Yes', 'Success'),
        button('no', '❌ No', 'Danger')
      )
    ]
  });
});

onButton('yes', async function() {
  await this.reply({ content: 'You voted yes!', ephemeral: true });
});

onButton('no', async function() {
  await this.reply({ content: 'You voted no!', ephemeral: true });
});
```

## 🎨 Button Templates

Create reusable, styled buttons with automatic event handling:

```javascript
// Define button templates
flow.button.template('confirm')
  .title('Confirm')
  .emoji('✅')
  .color('Success')
  .clickEvent(async function() {
    await this.update({ content: '✅ Confirmed!', components: [] });
  });

flow.button.template('cancel')
  .title('Cancel')
  .emoji('❌')
  .color('Danger')
  .clickEvent(async function() {
    await this.update({ content: '❌ Cancelled', components: [] });
  });

flow.button.template('info')
  .title('More Info')
  .emoji('ℹ️')
  .color('Primary')
  .clickEvent(async function() {
    await this.reply({ content: 'Here is more information...', ephemeral: true });
  });

// Use in any command
command.new('action', 'Choose an action', async function() {
  await reply({
    content: 'What would you like to do?',
    components: [
      row(
        flow.button.build('confirm'),
        flow.button.build('cancel'),
        flow.button.build('info')
      )
    ]
  });
});
```

**Available colors:** `Primary`, `Secondary`, `Success`, `Danger`, `Link`

**Template methods:**
- `.title(text)` - Button label
- `.emoji(emoji)` - Button emoji
- `.color(style)` - Button style/color
- `.disabled(true)` - Disable button
- `.clickEvent(handler)` - Click handler with context (`this`)
- `.build()` - Build the button component

## 📊 Server Stats & Metrics (NEW)

Get server statistics instantly with the global `stats` object:

```javascript
command.new('serverstats', 'Show server statistics', async function() {
  await reply({
    embeds: [embed({
      title: `📊 ${stats.guild.name} Statistics`,
      fields: [
        { name: '👥 Members', value: `${stats.members.all} (${stats.members.online} online)`, inline: true },
        { name: '🤖 Bots', value: `${stats.members.bots}`, inline: true },
        { name: '🆕 New (24h)', value: `${stats.members.new24h}`, inline: true },
        { name: '📢 Channels', value: `${stats.channels.all} total`, inline: true },
        { name: '🎭 Roles', value: `${stats.roles.all}`, inline: true },
        { name: '😀 Emojis', value: `${stats.emojis.all}/${stats.emojis.maxSlots}`, inline: true },
        { name: '💎 Boosts', value: `Level ${stats.boost.level} (${stats.boost.count} boosts)`, inline: true },
        { name: '🔊 In Voice', value: `${stats.voice.active}`, inline: true },
        { name: '🎂 Server Age', value: `${stats.guild.age} days`, inline: true },
      ],
      color: 0x5865F2,
      timestamp: true
    })]
  });
});
```

**Available Stats:**

**Members:**
- `stats.members.all` - Total members
- `stats.members.online` - Online members
- `stats.members.offline` - Offline members
- `stats.members.bots` - Bot count
- `stats.members.humans` - Human count
- `stats.members.new24h` - Joined in last 24h
- `stats.members.new7d` - Joined in last 7 days
- `stats.members.withRoles` - Members with roles
- `stats.members.withoutRoles` - Members without roles

**Guild:**
- `stats.guild.name` - Server name
- `stats.guild.id` - Server ID
- `stats.guild.description` - Server description
- `stats.guild.ownerId` - Owner ID
- `stats.guild.owner` - Owner member object
- `stats.guild.age` - Server age in days
- `stats.guild.createdAt` - Creation date
- `stats.guild.boostLevel` - Boost level (0-3)
- `stats.guild.boostCount` - Boost count
- `stats.guild.verified` - Is verified
- `stats.guild.partnered` - Is partnered
- `stats.guild.icon` - Server icon URL
- `stats.guild.banner` - Server banner URL

**Channels:**
- `stats.channels.all` - Total channels
- `stats.channels.text` - Text channels
- `stats.channels.voice` - Voice channels
- `stats.channels.categories` - Categories
- `stats.channels.stage` - Stage channels
- `stats.channels.forum` - Forum channels
- `stats.channels.threads` - Thread channels

**Roles:**
- `stats.roles.all` - Total roles
- `stats.roles.admin` - Admin roles
- `stats.roles.mentionable` - Mentionable roles
- `stats.roles.hoisted` - Hoisted roles
- `stats.roles.managed` - Bot/managed roles
- `stats.roles.highest` - Highest role
- `stats.roles.lowest` - @everyone role

**Emojis:**
- `stats.emojis.all` - Total emojis
- `stats.emojis.static` - Static emojis
- `stats.emojis.animated` - Animated emojis
- `stats.emojis.maxSlots` - Max emoji slots
- `stats.emojis.remaining` - Remaining slots

**Stickers:**
- `stats.stickers.all` - Total stickers
- `stats.stickers.maxSlots` - Max sticker slots
- `stats.stickers.remaining` - Remaining slots

**Voice:**
- `stats.voice.active` - Members in voice
- `stats.voice.muted` - Muted members
- `stats.voice.deafened` - Deafened members
- `stats.voice.streaming` - Streaming members
- `stats.voice.video` - Video enabled members

**Boosts:**
- `stats.boost.level` - Boost level (0-3)
- `stats.boost.count` - Total boosts
- `stats.boost.boosters` - Booster count
- `stats.boost.neededForNext` - Boosts needed for next level
- `stats.boost.progress` - Progress to next level (0-100)

**Moderation:**
- `await stats.moderation.bans()` - Ban count (async)
- `stats.moderation.timedOut` - Timed out members

**Full Report:**
```javascript
const report = await stats.getFullReport();
console.log(report); // Complete server statistics object
```

## 📡 Events

`createBot` exposes global helpers like `on`, `once`, and `log` once your bot is running. Register listeners anywhere in your app after boot:

```javascript
import { createBot } from 'disflow';

await createBot();

on('guildMemberAdd', async (member) => {
  await log(`${member.user.tag} joined!`);
});

on('guildMemberRemove', async (member) => {
  await log(`${member.user.tag} left!`);
});
```

You can place this snippet in your entry file or split it into any module you import.

## 📝 Logging Options

Disflow automatically logs command usage and errors. By default it will try to create a `#bot-logs` channel when missing. You can disable automatic channel creation if your bot lacks the **Manage Channels** permission:

```javascript
await createBot({
  logging: {
    autoCreateChannel: false,
  },
});
```

## 🔥 Hot Reload (currently beta)

Commands automatically reload when you save files — no need to restart your bot!

**Enabled by default.** Just edit your command files and watch them reload instantly:

```javascript
// commands/test.js
bot.command.new('test', 'Test command', async function() {
  await this.reply('Version 1');
});

// Edit and save -> Auto reloads!
// Change to: await this.reply('Version 2');
// Command updates instantly without restart
```

**Console output:**
```
🔥 Hot reload enabled - watching for changes...
👁️ Watching: commands/
🔄 File changed: test.js
✅ Reloaded: test.js
📡 Commands re-registered with Discord
```

**Control via .env file:**

```env
DISCORD_TOKEN=your_token_here
HOT_RELOAD=true
```

**Accepted values:**
- `true`, `1`, `yes` → Enable hot reload
- `false`, `0`, `no` → Disable hot reload

**Or disable via code:**

```javascript
await createBot({
  hotReload: false
});
```

**Priority:**
1. Code option (`options.hotReload`)
2. `.env` file (`HOT_RELOAD`)
3. Default (`true`)

**Features:**
- ✅ Auto-reload on file save
- ✅ Watches nested command folders
- ✅ Auto re-registers with Discord
- ✅ Debounced (prevents multiple reloads)
- ✅ Handles file deletions
- ✅ No bot restart needed
- ✅ Configurable via .env

## 🎯 Why Disflow?

**Problem:** Complex setup, long code, confusing event handling...

**Solution:** Disflow!

```javascript
// Traditional method — 50+ lines of code
const client = new Client({ ... });
client.on('ready', () => { ... });
client.on('interactionCreate', () => { ... });
// Register commands...
// Deploy to Discord...
// ...

// Disflow — 5 lines of code
import { createBot } from 'disflow';
await createBot();

bot.command.new('ping', 'Pong!', async function() {
  await this.reply('Pong!');
});
```

## 📦 Installation

```bash
npm install disflow discord.js
```

## 📚 Documentation

Full documentation: [disflow.fun](https://disflow.fun)

## 📄 License

MIT

**Support Mail** help@disflow.fun
**Made with love** 🌊 **Disflow**
