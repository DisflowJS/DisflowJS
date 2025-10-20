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
- **Buttons** — Interactive buttons made easy
- **Embeds** — Rich message support
- **Events** — Full Discord event system
- **Utils** — Random, time, emoji, and more
- **Auto Logging** — Built-in logging system
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
│   ├── random.js
│   └── time.js
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

Full documentation: [disflow.dev](https://disflow.dev)

## 📄 License

MIT

**Made with love** 🌊 **Disflow**
