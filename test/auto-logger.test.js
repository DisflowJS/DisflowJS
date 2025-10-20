import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import AutoLogger from '../src/core/auto-logger.js';

test('AutoLogger skips channel creation when disabled', async () => {
  const autoLogger = new AutoLogger({});
  autoLogger.configure({ autoCreateChannel: false });

  let createCalled = false;
  const guild = {
    id: 'guild-1',
    channels: {
      cache: { find: () => null },
      create: async () => {
        createCalled = true;
        return null;
      }
    }
  };

  const channel = await autoLogger.getLogChannel(guild);

  assert.equal(channel, null);
  assert.equal(createCalled, false);
  assert.equal(autoLogger.logChannels.get('guild-1'), false);
});

test('AutoLogger caches missing permissions when attempting channel creation', async () => {
  const autoLogger = new AutoLogger({});

  let createCalled = false;
  const guild = {
    id: 'guild-2',
    name: 'Test Guild',
    channels: {
      cache: { find: () => null },
      create: async () => {
        createCalled = true;
        return null;
      }
    },
    members: {
      me: {
        permissions: {
          has: () => false
        }
      }
    }
  };

  const channel = await autoLogger.getLogChannel(guild);

  assert.equal(channel, null);
  assert.equal(createCalled, false);
  assert.equal(autoLogger.logChannels.get('guild-2'), false);

  await autoLogger.getLogChannel(guild);
  assert.equal(createCalled, false);
});

test('AutoLogger creates a channel when permissions allow it', async () => {
  const autoLogger = new AutoLogger({});

  let createCalled = false;
  const createdChannel = { id: 'channel', isTextBased: () => true };
  const guild = {
    id: 'guild-3',
    name: 'Guild 3',
    channels: {
      cache: { find: () => null },
      create: async () => {
        createCalled = true;
        return createdChannel;
      }
    },
    members: {
      me: {
        permissions: {
          has: () => true
        }
      }
    }
  };

  const channel = await autoLogger.getLogChannel(guild);

  assert.equal(createCalled, true);
  assert.equal(channel, createdChannel);
  assert.equal(autoLogger.logChannels.get('guild-3'), createdChannel);
});

test('AutoLogger.log sends embeds to cached channel', async () => {
  const autoLogger = new AutoLogger({});

  const payloads = [];
  const guild = { id: 'guild-4' };
  autoLogger.logChannels.set('guild-4', {
    send: async (payload) => {
      payloads.push(payload);
    }
  });

  await autoLogger.log(guild, 'Hello world', { title: 'Greeting' });

  assert.equal(payloads.length, 1);
  const [payload] = payloads;
  assert.ok(Array.isArray(payload.embeds));
  assert.equal(payload.embeds[0].description, 'Hello world');
  assert.equal(payload.embeds[0].title, 'Greeting');
});
