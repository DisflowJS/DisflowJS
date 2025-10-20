/**
 * 📦 Disflow Loader
 */

import { readdir } from 'fs/promises';
import { join, extname, relative } from 'path';
import { pathToFileURL } from 'url';
import logger from './logger.js';

class Loader {
  constructor() {
    this.emoji = {};
    this.vals = {};
    this.baseDir = null;
    this.slashHandler = null;
  }

  /**
   * Set the base directory
   */
  setBaseDir(dir) {
    this.baseDir = dir;
  }

  /**
   * Set slash handler reference
   */
  setSlashHandler(handler) {
    this.slashHandler = handler;
  }

  /**
   * Set bot instance reference
   */
  setBotInstance(instance) {
    this.botInstance = instance;
  }

  /**
   * Load all user slash commands from /commands directory
   */
  async loadCommands() {
    if (!this.slashHandler || !this.botInstance) {
      logger.error('SlashHandler or BotInstance not set, cannot load commands');
      return;
    }

    const commandsPath = join(this.baseDir, 'commands');

    try {
      const commandFiles = await this.collectCommandFiles(commandsPath);
      commandFiles.sort((a, b) => a.localeCompare(b));

      if (commandFiles.length === 0) {
        logger.warn('No commands found in /commands directory');
        return;
      }

      let loadedCount = 0;

      for (const filePath of commandFiles) {
        const relativePath = relative(commandsPath, filePath);

        try {

          // Make bot available globally before loading command
          if (this.botInstance) {
            global.bot = this.botInstance;
          }

          const fileUrl = pathToFileURL(filePath).href;

          // Dynamic import with cache busting
          const commandModule = await import(`${fileUrl}?update=${Date.now()}`);

          // If has export default, register it
          if (commandModule.default && commandModule.default.name && commandModule.default.execute) {
            const cmd = commandModule.default;

            // Register as slash command
            this.slashHandler.register({
              name: cmd.name,
              description: cmd.description || 'No description',
              options: cmd.options || [],
              execute: cmd.execute
            });

            loadedCount++;
            logger.success(`Loaded command: /${cmd.name}`);
          } else {
            // No export default, but file was loaded
            // Any bot.command.new() calls inside will have executed
            logger.success(`Loaded file: ${relativePath}`);
          }
        } catch (error) {
          logger.error(`Failed to load ${relativePath}`, error);
        }
      }

      logger.info(`📦 Total commands loaded: ${loadedCount}`);
    } catch (err) {
      logger.warn('Commands directory not found (this is optional)');
    }
  }

  /**
   * Recursively collect supported command files
   */
  async collectCommandFiles(directory) {
    let entries;

    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      throw error;
    }

    const files = [];

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        const nested = await this.collectCommandFiles(fullPath);
        files.push(...nested);
        continue;
      }

      if (this.isSupportedCommandFile(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Determine if file extension is supported
   */
  isSupportedCommandFile(filename) {
    const SUPPORTED_EXTENSIONS = ['.js', '.mjs', '.cjs'];
    return SUPPORTED_EXTENSIONS.includes(extname(filename).toLowerCase());
  }

  /**
   * Load emoji dictionary from /emoji directory
   */
  async loadEmoji() {
    const emojiPath = join(this.baseDir, 'emoji', 'emoji.js');
    
    try {
      const fileUrl = pathToFileURL(emojiPath).href;
      const emojiModule = await import(`${fileUrl}?update=${Date.now()}`);
      
      if (emojiModule.default && typeof emojiModule.default === 'object') {
        this.emoji = emojiModule.default;
        logger.success(`Loaded ${Object.keys(this.emoji).length} emoji entries`);
      } else {
        logger.warn('Emoji file exists but no default export found');
      }
    } catch (err) {
      logger.warn('No emoji.js found (optional, but recommended for more fun)');
    }
  }

  /**
   * Load global values from /vals directory
   */
  async loadVals() {
    const valsPath = join(this.baseDir, 'vals', 'values.js');
    
    try {
      const fileUrl = pathToFileURL(valsPath).href;
      const valsModule = await import(`${fileUrl}?update=${Date.now()}`);
      
      if (valsModule.default && typeof valsModule.default === 'object') {
        this.vals = valsModule.default;
        logger.success(`Loaded ${Object.keys(this.vals).length} global values`);
      } else {
        logger.warn('Values file exists but no default export found');
      }
    } catch (err) {
      logger.warn('No values.js found (optional, but useful for config)');
    }
  }

  /**
   * Load everything at once
   */
  async loadAll() {
    logger.info('🔄 Loading user resources...');
    await this.loadCommands();
    await this.loadEmoji();
    await this.loadVals();
    logger.success('All resources loaded successfully');
  }

}

export { Loader };

export default new Loader();
