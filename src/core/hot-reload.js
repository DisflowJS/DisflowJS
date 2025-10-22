/**
 * 🔥 Hot Reload System
 * Auto-reload commands on file changes
 */

import fs from 'fs';
import path from 'path';

class HotReload {
  constructor(client, baseDir) {
    this.client = client;
    this.baseDir = baseDir;
    this.watchers = new Map();
    this.debounceTimers = new Map();
    this.enabled = false;
  }

  /**
   * Start watching for file changes
   */
  start() {
    if (this.enabled) {
      console.log('⚠️ Hot reload already enabled');
      return;
    }

    this.enabled = true;
    console.log('🔥 Hot reload enabled - watching for changes...');
    
    const commandsDir = path.join(this.baseDir, 'commands');
    
    // Check if commands directory exists
    if (!fs.existsSync(commandsDir)) {
      console.log('⚠️ Commands directory not found, hot reload disabled');
      return;
    }

    // Watch commands directory recursively
    this.watchDirectory(commandsDir);
  }

  /**
   * Watch a directory for changes
   */
  watchDirectory(dirPath) {
    try {
      const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Only watch .js files
        if (!filename.endsWith('.js')) return;

        const fullPath = path.join(dirPath, filename);

        // Debounce: avoid multiple reloads for the same file
        const debounceKey = fullPath;
        if (this.debounceTimers.has(debounceKey)) {
          clearTimeout(this.debounceTimers.get(debounceKey));
        }

        this.debounceTimers.set(debounceKey, setTimeout(() => {
          this.handleFileChange(eventType, fullPath, filename);
          this.debounceTimers.delete(debounceKey);
        }, 100));
      });

      this.watchers.set(dirPath, watcher);
      console.log(`👁️ Watching: ${path.relative(this.baseDir, dirPath)}/`);
    } catch (error) {
      console.error(`Failed to watch directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Handle file change event
   */
  async handleFileChange(eventType, fullPath, filename) {
    // Check if file still exists (handles deletion)
    const fileExists = fs.existsSync(fullPath);
    
    if (eventType === 'rename') {
      if (fileExists) {
        console.log(`✨ New file detected: ${filename}`);
        await this.reloadCommand(fullPath);
      } else {
        console.log(`🗑️ File deleted: ${filename}`);
        await this.unloadCommand(fullPath);
      }
    } else if (eventType === 'change') {
      console.log(`🔄 File changed: ${filename}`);
      await this.reloadCommand(fullPath);
    }
  }

  /**
   * Reload a specific command file
   */
  async reloadCommand(filePath) {
    try {
      // Get command name from file path
      const relativePath = path.relative(path.join(this.baseDir, 'commands'), filePath);
      const commandName = path.basename(filePath, '.js');

      // Clear require cache for this file
      const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
      
      // Delete from module cache
      if (require.cache[filePath]) {
        delete require.cache[filePath];
      }

      // Remove existing command
      if (this.client.commands?.has(commandName)) {
        this.client.commands.delete(commandName);
      }

      // Wait a bit to ensure file is written completely
      await new Promise(resolve => setTimeout(resolve, 50));

      // Re-import the module
      try {
        const module = await import(`${fileUrl}?update=${Date.now()}`);
        console.log(`✅ Reloaded: ${relativePath}`);
        
        // Re-register commands if needed
        if (this.client.autoRegister && this.client.applicationId) {
          await this.client.registerCommands();
          console.log('📡 Commands re-registered with Discord');
        }
      } catch (error) {
        console.error(`❌ Error reloading ${relativePath}:`, error.message);
      }
    } catch (error) {
      console.error('Reload error:', error.message);
    }
  }

  /**
   * Unload a deleted command
   */
  async unloadCommand(filePath) {
    try {
      const commandName = path.basename(filePath, '.js');
      
      if (this.client.commands?.has(commandName)) {
        this.client.commands.delete(commandName);
        console.log(`🗑️ Unloaded: ${commandName}`);
        
        // Re-register to remove from Discord
        if (this.client.autoRegister && this.client.applicationId) {
          await this.client.registerCommands();
          console.log('📡 Commands re-registered with Discord');
        }
      }
    } catch (error) {
      console.error('Unload error:', error.message);
    }
  }

  /**
   * Stop watching for changes
   */
  stop() {
    if (!this.enabled) return;

    for (const [dir, watcher] of this.watchers) {
      watcher.close();
      console.log(`👁️ Stopped watching: ${path.relative(this.baseDir, dir)}/`);
    }

    this.watchers.clear();
    this.debounceTimers.clear();
    this.enabled = false;
    console.log('🔥 Hot reload disabled');
  }

  /**
   * Check if hot reload is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

export default HotReload;
