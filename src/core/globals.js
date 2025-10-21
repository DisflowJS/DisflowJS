/**
 * 🌍 Global API
 */

import buttonTemplates from '../utils/button-templates.js';
import ServerMetrics from '../utils/metrics.js';

// Global state
let currentBot = null;
let currentContext = null;
let autoLogger = null;

if (typeof global.bot === 'undefined') {
  global.bot = null;
  global.$bot = null;
}

if (typeof global.$logger === 'undefined') {
  global.$logger = null;
}

/**
 * Initialize global API
 */
export function initGlobals(botInstance, logger) {
  if (!botInstance) {
    if (logger) {
      autoLogger = logger;
      global.$logger = logger;
    }
    return;
  }

  currentBot = botInstance;
  autoLogger = logger ?? null;

  // Make bot available globally
  global.bot = botInstance;
  global.$bot = botInstance;
  global.$logger = autoLogger;
}

/**
 * Set current command context
 */
export function setContext(context) {
  currentContext = context;
}

/**
 * Global command definition
 */
global.command = function(name, description, handler, options) {
  if (!currentBot) {
    console.error('❌ Bot not initialized! Call createBot() first.');
    return;
  }
  
  currentBot.command.new(name, description, handler, options);
};

/**
 * Global command object with .new() method
 */
global.command.new = function(name, description, handler, options) {
  if (!currentBot) {
    console.error('❌ Bot not initialized! Call createBot() first.');
    return;
  }
  
  currentBot.command.new(name, description, handler, options);
};

/**
 * Global reply function - works inside commands
 * Automatically handles duplicate replies
 */
global.reply = async function(content) {
  if (!currentContext) {
    throw new Error('reply() can only be called inside a command');
  }
  
  try {
    return await currentContext.reply(content);
  } catch (error) {
    console.error('Global reply error:', error.message);
  }
};

/**
 * Global edit function
 */
global.edit = async function(content) {
  if (!currentContext) {
    throw new Error('edit() can only be called inside a command');
  }
  return await currentContext.edit(content);
};

/**
 * Global defer function
 */
global.defer = async function(ephemeral = false) {
  if (!currentContext) {
    throw new Error('defer() can only be called inside a command');
  }
  return await currentContext.defer(ephemeral);
};

/**
 * Global followUp function
 */
global.followUp = async function(content) {
  if (!currentContext) {
    throw new Error('followUp() can only be called inside a command');
  }
  return await currentContext.followUp(content);
};

/**
 * Global parameter getters
 */
global.getString = function(name) {
  if (!currentContext) return null;
  return currentContext.getString(name);
};

global.getInteger = function(name) {
  if (!currentContext) return null;
  return currentContext.getInteger(name);
};

global.getBoolean = function(name) {
  if (!currentContext) return null;
  return currentContext.getBoolean(name);
};

global.getUser = function(name) {
  if (!currentContext) return null;
  return currentContext.getUser(name);
};

global.getChannel = function(name) {
  if (!currentContext) return null;
  return currentContext.getChannel(name);
};

global.getRole = function(name) {
  if (!currentContext) return null;
  return currentContext.getRole(name);
};

/**
 * Global user/guild/channel getters
 */
Object.defineProperty(global, 'user', {
  get: () => currentContext?.user || null
});

Object.defineProperty(global, 'guild', {
  get: () => currentContext?.guild || null
});

Object.defineProperty(global, 'channel', {
  get: () => currentContext?.channel || null
});

/**
 * Global utilities
 */
Object.defineProperty(global, 'random', {
  get: () => currentContext?.random || currentBot?.random || {}
});

Object.defineProperty(global, 'emoji', {
  get: () => currentContext?.emoji || currentBot?.emoji || {}
});

Object.defineProperty(global, 'vals', {
  get: () => currentContext?.vals || currentBot?.vals || {}
});

/**
 * Time utilities
 */
global.time = function(input) {
  return currentContext?.time(input) || currentBot?.time?.(input);
};

global.timeFormat = function(date) {
  return currentContext?.timeFormat(date) || currentBot?.timeFormat?.(date);
};

global.timeNow = function() {
  return currentContext?.timeNow() || currentBot?.timeNow?.() || new Date();
};

/**
 * ========== EVENT LISTENERS ==========
 */

/**
 * Listen to Discord events
 */
global.on = function(eventName, handler) {
  if (!currentBot?.client) {
    console.error('❌ Bot not initialized!');
    return;
  }
  
  currentBot.client.on(eventName, handler);
};

/**
 * Listen to event once
 */
global.once = function(eventName, handler) {
  if (!currentBot?.client) {
    console.error('❌ Bot not initialized!');
    return;
  }
  
  currentBot.client.once(eventName, handler);
};

/**
 * ========== LOGGING ==========
 */

global.log = async function(message, options = {}) {
  const guildToLog = currentContext?.guild || options.guild;
  
  if (!guildToLog) {
    console.log('📝', message);
    return;
  }
  
  await autoLogger?.log(guildToLog, message, options);
};

// info

global.logInfo = async function(message, title) {
  const guild = currentContext?.guild;
  if (!guild) return;
  await autoLogger?.logInfo(guild, message, title);
};

// warning

global.logWarning = async function(message, title) {
  const guild = currentContext?.guild;
  if (!guild) return;
  await autoLogger?.logWarning(guild, message, title);
};

// error

global.logError = async function(error, context) {
  const guild = currentContext?.guild;
  if (!guild) return;
  await autoLogger?.logError(guild, error, context);
};

// succes

global.logSuccess = async function(message, title) {
  const guild = currentContext?.guild;
  if (!guild) return;
  await autoLogger?.logSuccess(guild, message, title);
};

/**
 * ========== BUTTONS ==========
 */

global.button = function(customId, label, style = 'Primary') {
  const styleMap = {
    'Primary': 1,
    'Secondary': 2,
    'Success': 3,
    'Danger': 4,
    'Link': 5
  };
  
  return {
    type: 2, // BUTTON
    style: styleMap[style] || 1,
    label,
    custom_id: customId
  };
};

/**
 * Create an action row
 */
global.row = function(...components) {
  return {
    type: 1,
    components
  };
};

/**
 * Create an embed
 * Auto string convert
 */
global.embed = function(options) {
  // Auto string convert
  const fields = options.fields?.map(field => ({
    name: String(field.name),
    value: String(field.value),
    inline: field.inline
  }));

  return {
    title: options.title,
    description: options.description,
    color: options.color || 0x5865F2,
    fields,
    thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
    image: options.image ? { url: options.image } : undefined,
    footer: options.footer ? { text: options.footer } : undefined,
    timestamp: options.timestamp ? new Date() : undefined
  };
};

/**
 * Button intreaction
 */
global.onButton = function(customId, handler) {
  if (!currentBot?.client) {
    console.error('❌ Bot not initialized!');
    return;
  }
  
  currentBot.client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== customId) return;
    
    // Set context for the handler
    const context = currentBot.createContext?.(interaction);
    setContext(context);
    
    try {
      await handler.call(context, interaction);
    } catch (error) {
      console.error(`Button handler error for ${customId}:`, error);
    } finally {
      setContext(null);
    }
  });
};

/**
 * ========== CHANNEL HELPERS ==========
 */

// create channel

global.createChannel = async function(name, options = {}) {
  const targetGuild = currentContext?.guild || options.guild;
  
  if (!targetGuild) {
    console.error('❌ No guild context!');
    return null;
  }
  
  try {
    const channel = await targetGuild.channels.create({
      name,
      type: options.type || 0,
      topic: options.topic,
      parent: options.category,
      reason: options.reason || 'Created by bot'
    });
    
    return channel;
  } catch (error) {
    console.error('Failed to create channel:', error);
    return null;
  }
};

// find channel

global.findChannel = function(name) {
  const targetGuild = currentContext?.guild;
  
  if (!targetGuild) {
    console.error('❌ No guild context!');
    return null;
  }
  
  return targetGuild.channels.cache.find(ch => ch.name === name);
};

// send message

global.sendTo = async function(channelNameOrId, content) {
  const targetGuild = currentContext?.guild;
  
  if (!targetGuild) {
    console.error('❌ No guild context!');
    return;
  }
  
  const channel = targetGuild.channels.cache.find(
    ch => ch.name === channelNameOrId || ch.id === channelNameOrId
  );
  
  if (!channel || !channel.isTextBased()) {
    console.error(`❌ Channel not found: ${channelNameOrId}`);
    return;
  }
  
  try {
    if (typeof content === 'string') {
      await channel.send(content);
    } else {
      await channel.send(content);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

/**
 * ========== BUTTON TEMPLATES ==========
 */

global.flow = {
  button: {
    /**
     * Create a button template
     */
    template: function(id) {
      const template = buttonTemplates.create(id);
      
      // Auto-register when build is called
      const originalBuild = template.build.bind(template);
      template.build = function() {
        template.register(global.onButton);
        return originalBuild();
      };
      
      return template;
    },
    
    /**
     * Get existing template
     */
    get: function(id) {
      return buttonTemplates.get(id);
    },
    
    /**
     * Build from template
     */
    build: function(id) {
      return buttonTemplates.build(id);
    }
  }
};

/**
 * ========== SERVER STATS ==========
 */

/**
 * Global stats object - automatically uses current guild context
 */
Object.defineProperty(global, 'stats', {
  get: () => {
    const guild = currentContext?.guild;
    if (!guild) {
      console.warn('⚠️ stats requires guild context. Use inside commands or pass guild manually.');
      return null;
    }
    return new ServerMetrics(guild);
  }
});

/**
 * Create stats for specific guild
 */
global.getStats = function(guild) {
  const targetGuild = guild || currentContext?.guild;
  if (!targetGuild) {
    console.error('❌ No guild provided!');
    return null;
  }
  return new ServerMetrics(targetGuild);
};
