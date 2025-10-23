/**
 * ⚡ Slash Command Handler
 */

import { REST, Routes } from 'discord.js';
import logger from './logger.js';
import { setContext } from './globals.js';

class SlashHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Map();
  }

  /**
   * Register a slash command
   */
  register(commandData) {
    const { name, description, execute, options = [] } = commandData;
    
    if (!name || !description || !execute) {
      logger.error('Slash command must have name, description, and execute');
      return;
    }

    this.commands.set(name, {
      name,
      description,
      options,
      execute
    });
  }

  /**
   * Deploy commands to discord API
   */
  async deploy(token, clientId) {
    const commandsData = Array.from(this.commands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      options: cmd.options || []
    }));

    if (commandsData.length === 0) {
      logger.warn('No slash commands to deploy');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      logger.info(`🔄 Deploying ${commandsData.length} slash commands...`);

      // Deploy globally
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandsData }
      );

      logger.success(`✅ Successfully deployed ${commandsData.length} slash commands!`);
    } catch (error) {
      logger.error('Failed to deploy slash commands', error);
    }
  }

  async handleInteraction(interaction, botContext) {
    if (!interaction.isCommand()) return;

    const command = this.commands.get(interaction.commandName);
    
    if (!command) {
      logger.warn(`Unknown slash command: ${interaction.commandName}`);
      return;
    }

    this.client.activeInteractions++;

    logger.command(interaction.commandName, interaction.user.tag);

    try {
      // Immediately defer to avoid 3s timeout
      if (!interaction.deferred && !interaction.replied) {
        try {
          await interaction.deferReply({ flags: 0 });
        } catch (e) {
          if (e?.code === 10062) {
            logger.warn('⚠️ Interaction already expired before defer');
            return;
          }
          throw e;
        }
      }

      // Set global context for global API
      setContext(botContext);
      
      // Support both parameter and this context!
      await command.execute.call(botContext, botContext);
      
      // Clear global context after execution
      setContext(null);
    } catch (error) {
      logger.error(`Slash command '${interaction.commandName}' failed`, error);
      
      const errorMessage = '❌ Something went wrong executing this command.';
      
      try {
        if (interaction.replied || interaction.deferred) {
          // flags: 64 => ephemeral
          await interaction.followUp({ content: errorMessage, flags: 64 });
        } else {
          await interaction.reply({ content: errorMessage, flags: 64 });
        }
      } catch {
        // Silently fail if we can't send error
      }
    } finally {
      this.client.activeInteractions--;
    }
  }

  /**
   * Get all registered commands
   */
  getAll() {
    return Array.from(this.commands.values());
  }

  /**
   * Check if command exists
   */
  has(name) {
    return this.commands.has(name);
  }

  /**
   * Remove a command
   */
  remove(name) {
    return this.commands.delete(name);
  }
}

export default SlashHandler;
