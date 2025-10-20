import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtemp, writeFile, mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join, relative } from 'path';

import loaderSingleton, { Loader } from '../src/core/loader.js';

const ORIGINAL_GLOBAL_BOT = { value: global.bot };
const ORIGINAL_GLOBAL_$BOT = { value: global.$bot };

function restoreGlobalBot() {
  global.bot = ORIGINAL_GLOBAL_BOT.value ?? null;
  global.$bot = ORIGINAL_GLOBAL_$BOT.value ?? null;
}

test('collectCommandFiles recurses into nested directories and filters supported extensions', async (t) => {
  const loader = new Loader();
  const tempDir = await mkdtemp(join(tmpdir(), 'disflow-loader-'));

  t.after(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  await mkdir(join(tempDir, 'nested', 'deeper'), { recursive: true });

  await writeFile(join(tempDir, 'alpha.js'), 'export default {};' );
  await writeFile(join(tempDir, 'nested', 'beta.mjs'), 'export default {};' );
  await writeFile(join(tempDir, 'nested', 'deeper', 'gamma.cjs'), 'module.exports = {};' );
  await writeFile(join(tempDir, 'ignore.txt'), 'noop');

  const files = await loader.collectCommandFiles(tempDir);
  const relativePaths = files.map(file => relative(tempDir, file)).sort();

  assert.deepEqual(relativePaths, [
    'alpha.js',
    join('nested', 'beta.mjs'),
    join('nested', 'deeper', 'gamma.cjs')
  ]);
});

test('loadCommands registers default exports in deterministic order', async (t) => {
  const projectDir = await mkdtemp(join(tmpdir(), 'disflow-project-'));

  t.after(async () => {
    await rm(projectDir, { recursive: true, force: true });
    restoreGlobalBot();
    loaderSingleton.setBaseDir(null);
    loaderSingleton.setSlashHandler(null);
    loaderSingleton.setBotInstance(null);
  });

  const commandsDir = join(projectDir, 'commands');
  await mkdir(join(commandsDir, 'nested', 'deeper'), { recursive: true });

  await writeFile(
    join(commandsDir, 'alpha.js'),
    `export default {
      name: 'alpha',
      description: 'Alpha command',
      options: [],
      async execute() {}
    };`
  );

  await writeFile(
    join(commandsDir, 'nested', 'beta.mjs'),
    `export default {
      name: 'beta',
      description: 'Beta command',
      async execute() {}
    };`
  );

  await writeFile(
    join(commandsDir, 'nested', 'deeper', 'gamma.cjs'),
    `module.exports = {
      name: 'gamma',
      description: 'Gamma command',
      async execute() {}
    };`
  );

  const registered = [];
  const slashHandler = {
    register(command) {
      registered.push(command);
    }
  };

  const botStub = { command: { new: () => {} } };
  loaderSingleton.setBaseDir(projectDir);
  loaderSingleton.setSlashHandler(slashHandler);
  loaderSingleton.setBotInstance(botStub);

  await loaderSingleton.loadCommands();

  assert.deepEqual(registered.map(cmd => cmd.name), ['alpha', 'beta', 'gamma']);
});
