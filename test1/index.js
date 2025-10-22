/**
 * 🌊 test1
 * Powered by Disflow Framework
 */

import { createBot } from 'disflow';

console.log('🚀 Starting bot...\n');

// Create bot with hot reload enabled (default)
// Commands will auto-reload on file changes! 🔥
await createBot();

// Load utils
await import('./utils/buttonTemplates.js');
await import('./utils/events.js');

console.log('\n✅ Bot ready!');
console.log('🔥 Hot reload is enabled - edit commands and they will auto-reload!\n');
