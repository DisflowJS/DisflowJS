/**
 * 🤖 Disflow Client
 */

import { Client, GatewayIntentBits, Events } from 'discord.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import logger from './logger.js';
import loader from './loader.js';
import random from '../utils/random.js';
import time from '../utils/time.js';
import SlashHandler from './slash-handler.js';
import CommandBuilder from './command-builder.js';
import AutoLogger from './auto-logger.js';
import HotReload from './hot-reload.js';

class DisflowClient {
  constructor() {
    // Create Discord.js client with common intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ]
    });

    this.token = null;
    this.ready = false;
    this.baseDir = null;
    this.applicationId = null;
    this.autoRegister = false;
    this.hotReloadEnabled = true; // Default enabled

    // Slash command handler
    this.slashHandler = new SlashHandler(this.client);

    // Command builder API for defining commands in code
    this.command = new CommandBuilder(this.slashHandler);

    // Auto logger
    this.autoLogger = new AutoLogger(this.client);

    // Hot reload system
    this.hotReload = null;

    // Commands map reference
    this.commands = this.slashHandler.commands;

    // Initialize event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup core
   */
  setupEventHandlers() {
    // Bot ready
    this.client.on(Events.ClientReady, async () => {
      this.ready = true;
      logger.success(`Bot logged in as ${this.client.user.tag}`);
      logger.info(`Serving ${this.client.guilds.cache.size} servers`);
      
      // Build slash commands
      await this.slashHandler.deploy(this.token, this.client.user.id);
    });

    // Slash command interaction handler
    this.client.on(Events.InteractionCreate, async (interaction) => {
      await this.slashHandler.handleInteraction(interaction, this.createContext(interaction));
    });

    // Global error handler
    this.client.on(Events.Error, (error) => {
      logger.error('Discord client error', error);
    });

    // Process error handlers
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled promise rejection', error);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      process.exit(1);
    });
  }

  /**
   * Helper: Auto string converter
   */
  normalizeEmbeds(content) {
    if (!content.embeds) return content;
    
    const normalized = { ...content };
    normalized.embeds = content.embeds.map(embed => {
      if (!embed.fields) return embed;
      
      return {
        ...embed,
        fields: embed.fields.map(field => ({
          name: String(field.name),
          value: String(field.value),
          inline: field.inline
        }))
      };
    });
    
    return normalized;
  }

  /**
   * Create bot context object
   */
  createContext(interaction) {
    // Reference to normalizeEmbeds for use in context
    const normalizeEmbeds = this.normalizeEmbeds.bind(this);
    return {
      // Discord.js client
      client: this.client,
      
      // Current interaction
      interaction: interaction,
      
      // Random utilities
      random: {
        number: random.number.bind(random),
        string: random.string.bind(random),
        bool: random.bool.bind(random),
        pick: random.pick.bind(random),
      },
      
      // Time utilities
      time: time.parse.bind(time),
      timeFormat: time.format.bind(time),
      timeNow: time.now.bind(time),
      
      // User data
      emoji: loader.emoji,
      vals: loader.vals,
      
      // Helper to get all commands
      getCommands: () => this.slashHandler.getAll(),
      
      // Auto logger
      logger: this.autoLogger,
      
      /**
       * Reply to the command
       * Automatically handles already replied or deferred interactions
       * Auto string converter
       */
      reply: async (content) => {
        try {
          // Auto string converter
          if (typeof content === 'object' && content.embeds) {
            content = normalizeEmbeds(content);
          }
          
          if (interaction.replied) {
            return await interaction.followUp(typeof content === 'string' ? { content } : content);
          }
          
          if (interaction.deferred) {
            return await interaction.editReply(typeof content === 'string' ? { content } : content);
          }
          
          // Normal reply
          if (typeof content === 'string') {
            return await interaction.reply(content);
          }
          return await interaction.reply(content);
        } catch (error) {
          console.error('Reply error:', error.message);
          try {
            return await interaction.followUp(typeof content === 'string' ? { content } : content);
          } catch {

          }
        }
      },
      
      /**
       * Edit the reply
       * Auto string converter
       */
      edit: async (content) => {
        try {
          if (typeof content === 'object' && content.embeds) {
            content = normalizeEmbeds(content);
          }
          
          if (typeof content === 'string') {
            return await interaction.editReply(content);
          }
          return await interaction.editReply(content);
        } catch (error) {
          console.error('Edit error:', error.message);
        }
      },
      
      /**
       * Update the interaction
       * Auto string converter
       */
      update: async (content) => {
        try {
          // Auto-convert embed field values to strings
          if (typeof content === 'object' && content.embeds) {
            content = normalizeEmbeds(content);
          }
          
          if (typeof content === 'string') {
            return await interaction.update(content);
          }
          return await interaction.update(content);
        } catch (error) {
          console.error('Update error:', error.message);
        }
      },
      
      defer: async (ephemeral = false) => {
        return await interaction.deferReply({ ephemeral });
      },
      
      followUp: async (content) => {
        if (typeof content === 'string') {
          return await interaction.followUp(content);
        }
        return await interaction.followUp(content);
      },
      
      /**
       * Get a string option
       */
      getString: (name) => interaction.options?.getString(name),
      
      /**
       * Get an integer option
       */
      getInteger: (name) => interaction.options?.getInteger(name),
      
      /**
       * Get a boolean option
       */
      getBoolean: (name) => interaction.options?.getBoolean(name),
      
      /**
       * Get a user option
       */
      getUser: (name) => interaction.options?.getUser(name),
      
      /**
       * Get a channel option
       */
      getChannel: (name) => interaction.options?.getChannel(name),
      
      /**
       * Get a role option
       */
      getRole: (name) => interaction.options?.getRole(name),
      
      /**
       * Get the user who ran the command
       */
      get user() {
        return interaction.user;
      },
      
      /**
       * Get the guild where command was run
       */
      get guild() {
        return interaction.guild;
      },
      
      /**
       * Get the channel where command was run
       */
      get channel() {
        return interaction.channel;
      },
    };
  }

  /**
   * Parse .env file content
   */
  parseEnv(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const match = trimmed.match(/^(DISCORD_TOKEN|BOT_TOKEN)\s*=\s*(.+)$/);
      if (match) {
        return match[2].replace(/^["']|["']$/g, '').trim();
      }
    }
    return null;
  }

  /**
   * Parse HOT_RELOAD setting from .env
   */
  parseHotReload(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const match = trimmed.match(/^HOT_RELOAD\s*=\s*(.+)$/);
      if (match) {
        const value = match[1].replace(/^["']|["']$/g, '').trim().toLowerCase();
        return value === 'true' || value === '1' || value === 'yes';
      }
    }
    return null; // Not found, use default
  }

  /**
   * Auto-load token from .env or token.txt file
   * Priority: .env > token.txt
   */
  async loadToken(baseDir) {
    // search for env
    const envPath = join(baseDir, '.env');
    try {
      const envContent = await readFile(envPath, 'utf-8');
      this.token = this.parseEnv(envContent);
      
      // Parse HOT_RELOAD setting
      const hotReloadSetting = this.parseHotReload(envContent);
      if (hotReloadSetting !== null) {
        this.hotReloadEnabled = hotReloadSetting;
      }
      
      if (this.token) {
        logger.success('Token loaded from .env');
        return;
      }
    } catch (error) {

    }

    // Fallback to token.txt (old system)
    const tokenPath = join(baseDir, 'token.txt');
    try {
      const tokenContent = await readFile(tokenPath, 'utf-8');
      this.token = tokenContent.trim();
      
      if (!this.token || this.token === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
        throw new Error('Token not configured in token.txt');
      }
      
      logger.success('Token loaded from token.txt');
      return;
    } catch (error) {

    }

    // if don't found token
    logger.error('No token found! Create .env or token.txt with your bot token.');
    logger.info('Option 1: Create .env file with: DISCORD_TOKEN=your_token_here');
    logger.info('Option 2: Create token.txt file with your token');
    process.exit(1);
  }

  /**
   * Start the bot
   */
  async start(baseDir, options = {}) {
    logger.banner();

    this.baseDir = baseDir;
    this.autoLogger.configure(options.logging || {});

    // Set base directory for loader
    loader.setBaseDir(baseDir);
    
    // Set slash handler reference for loader
    loader.setSlashHandler(this.slashHandler);
    
    // Set bot instance for loader
    loader.setBotInstance(this);

    // Load token
    await this.loadToken(baseDir);

    // Load user resources
    await loader.loadAll();

    // Login to Discord
    logger.info('🚀 Connecting to Discord...');
    try {
      await this.client.login(this.token);
      this.applicationId = this.client.user?.id;
      this.autoRegister = true;
    } catch (error) {
      logger.error('Failed to login to Discord', error);
      logger.error('Make sure your token is valid and the bot has proper permissions');
      process.exit(1);
    }

    // Start hot reload if enabled
    // Priority: options.hotReload > .env HOT_RELOAD > default (true)
    const shouldEnableHotReload = options.hotReload !== undefined 
      ? options.hotReload 
      : this.hotReloadEnabled;

    if (shouldEnableHotReload) {
      this.hotReload = new HotReload(this, baseDir);
      // Wait for client to be ready before starting hot reload
      this.client.once(Events.ClientReady, () => {
        setTimeout(() => {
          this.hotReload.start();
        }, 1000);
      });
    } else {
      logger.info('🔥 Hot reload disabled');
    }
  }

  async registerCommands() {
    if (this.ready && this.applicationId) {
      await this.slashHandler.deploy(this.token, this.applicationId);
    }
  }

  async stop() {
    logger.info('Shutting down...');
    
    // Stop hot reload
    if (this.hotReload) {
      this.hotReload.stop();
    }
    
    await this.client.destroy();
    logger.success('Bot stopped');
  }
}

export default DisflowClient;
