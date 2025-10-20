/**
 * 🌊 Disflow 
 */

import DisflowClient from './core/client.js';
import { initGlobals } from './core/globals.js';

export async function createBot(options = {}) {
  const client = new DisflowClient();
  
  const baseDir = options.baseDir || process.cwd();
  
  initGlobals(client, client.autoLogger);
  
  await client.start(baseDir, options);
  
  return client;
}

export { DisflowClient };

export default { createBot, DisflowClient };
