/**
 * 📝 Automatic Logger
 * Auto log system
 */

import { PermissionFlagsBits } from 'discord.js';
import logger from './logger.js';

class AutoLogger {
  constructor(client) {
    this.client = client;
    this.logChannelName = 'bot-logs';
    this.logChannels = new Map();
    this.autoCreateChannels = true;
  }

  configure(options = {}) {
    if (typeof options.autoCreateChannel === 'boolean') {
      this.autoCreateChannels = options.autoCreateChannel;
    }
  }

  async getLogChannel(guild) {
    if (!guild) return null;

    // Check cache
    if (this.logChannels.has(guild.id)) {
      const channel = this.logChannels.get(guild.id);
      if (channel === false) return null;
      if (channel) return channel;
    }

    let logChannel = guild.channels.cache.find(
      ch => ch.name === this.logChannelName && ch.isTextBased()
    );

    // Create if don't exist
    if (!logChannel && this.autoCreateChannels) {
      const me = guild.members?.me;
      const hasPermission = me?.permissions?.has?.(PermissionFlagsBits.ManageChannels);

      if (!hasPermission) {
        logger.warn(`Missing MANAGE_CHANNELS permission in ${guild.name}, skipping log channel creation`);
        this.logChannels.set(guild.id, false);
        return null;
      }

      try {
        logChannel = await guild.channels.create({
          name: this.logChannelName,
          type: 0,
          topic: '🤖 Bot activity logs',
          reason: 'Automatic log channel created by Disflow'
        });
        logger.success(`Created log channel in ${guild.name}`);
      } catch (error) {
        logger.error(`Failed to create log channel in ${guild.name}`, error);
        this.logChannels.set(guild.id, false);
        return null;
      }
    } else if (!logChannel && !this.autoCreateChannels) {
      this.logChannels.set(guild.id, false);
      return null;
    }

    // Cache
    this.logChannels.set(guild.id, logChannel || false);
    return logChannel;
  }

  async log(guild, content, options = {}) {
    const channel = await this.getLogChannel(guild);
    if (!channel) return;

    try {
      const embed = {
        description: content,
        color: options.color || 0x5865F2,
        timestamp: new Date(),
        footer: { text: '🤖 Disflow Bot' }
      };

      if (options.title) embed.title = options.title;
      if (options.fields) embed.fields = options.fields;

      await channel.send({ embeds: [embed] });
    } catch (error) {
      logger.error('Failed to send log', error);
    }
  }

  /**
   * Log command use
   */
  async logCommand(guild, commandName, user, success = true) {
    const emoji = success ? '✅' : '❌';
    const color = success ? 0x57F287 : 0xED4245;

    await this.log(guild, `${emoji} Command executed`, {
      color,
      fields: [
        { name: 'Command', value: `/${commandName}`, inline: true },
        { name: 'User', value: user.tag, inline: true },
        { name: 'Status', value: success ? 'Success' : 'Failed', inline: true }
      ]
    });
  }

  /**
   * Log error
   */
  async logError(guild, error, context = '') {
    await this.log(guild, `❌ Error occurred`, {
      color: 0xED4245,
      title: '⚠️ Error',
      fields: [
        { name: 'Context', value: context || 'Unknown' },
        { name: 'Error', value: error.message || String(error) }
      ]
    });
  }

  /**
   * Log info
   */
  async logInfo(guild, message, title = '') {
    await this.log(guild, message, {
      title: title || 'ℹ️ Info',
      color: 0x5865F2
    });
  }

  /**
   * Log warning
   */
  async logWarning(guild, message, title = '') {
    await this.log(guild, message, {
      title: title || '⚠️ Warning',
      color: 0xFEE75C
    });
  }

  /**
   * Log success
   */
  async logSuccess(guild, message, title = '') {
    await this.log(guild, message, {
      title: title || '✅ Success',
      color: 0x57F287
    });
  }
}

export default AutoLogger;
