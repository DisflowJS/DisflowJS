/**
 * 🧱 Command Builder
 * 
 * 🔧 Usage:
 *
 * // Inside commands/ folder
 * bot.command.new('ping', 'Pong!', async function() {
 *   await this.reply('Pong!');
 * });
 *
 * // Globally (after createBot)
 * command('ping', 'Pong!', async function() {
 *   await reply('Pong!');
 * });
 */

import logger from './logger.js';

class CommandBuilder {
  constructor(slashHandler) {
    this.slashHandler = slashHandler;
  }

  /**
   * Create and register a new slash command.
   * You give it a name description and function
   * @param {string} name - Command name
   * @param {string} description - Command description
   * @param {Function} executor - Function to execute when command runs
   * @param {Array} options - Optional parameters (defaults to [])
   * @returns {CommandBuilder}
   * @example
   * bot.command.new('hello', 'Says hello', async function() {
   *   await this.reply('Hello!');
   * });
   */
  new(name, description, executor, options = []) {
    if (!name || typeof name !== 'string') {
      logger.error('Command name must be a non-empty string');
      return this;
    }

    if (!description || typeof description !== 'string') {
      logger.error('Command description must be a non-empty string');
      return this;
    }

    if (!executor || typeof executor !== 'function') {
      logger.error('Command executor must be a function');
      return this;
    }

    // Register slash commands
    this.slashHandler.register({
      name: name.toLowerCase(),
      description,
      options,
      execute: executor
    });

    logger.success(`Slash command registered: /${name}`);

    return this;
  }

  /**
   * Alias
   */
  add(name, description, executor) {
    return this.new(name, description, executor);
  }

  define(name, description, executor) {
    return this.new(name, description, executor);
  }

  register(name, description, executor) {
    return this.new(name, description, executor);
  }

  /**
   * Remove a registered command
   */
  remove(name) {
    const removed = this.slashHandler.remove(name);
    if (removed) {
      logger.info(`Command removed: /${name}`);
    }
    return removed;
  }

  /**
   * Check if a command exists.
   * @param {string} name - Command name
   * @returns {boolean}
   */
  has(name) {
    return this.slashHandler.has(name);
  }

  /**
   * List of registred commands
   */
  list() {
    return this.slashHandler.getAll().map(cmd => cmd.name);
  }

  /**
   * Get descriptions
   */
  getAll() {
    return this.slashHandler.getAll();
  }
}

export default CommandBuilder;