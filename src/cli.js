#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
  .command(['setup', 's'], 'Initialize mobile app manager in project', {}, async (argv) => {
    await require('./commands/setup')(argv);
  })
  .command(['clean', 'c'], 'Clean build artifacts', {}, async (argv) => {
    await require('./commands/clean')(argv);
  })
  .command(['install <type>', 'i <type>'], 'Install mobile-app-manager (local or prod)', {}, async (argv) => {
    await require('./commands/install')(argv);
  })
  .command(['ios'], 'Run iOS app', {}, async (argv) => {
    await require('./commands/ios')(argv);
  })
  .command(['android'], 'Run Android app', {}, async (argv) => {
    await require('./commands/android')(argv);
  })
  .command(['version', 'v'], 'Show version', {}, async (argv) => {
    await require('./commands/version')(argv);
  })
  .demandCommand(1, 'You need to specify a command')
  .help()
  .argv;
