#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
  .command('setup', 'Initialize mobile app manager in project', {}, (argv) => {
    require('./commands/setup')();
  })
  .command('clean', 'Clean build artifacts', {}, (argv) => {
    require('./commands/clean')();
  })
  .command('ios', 'Run iOS app', {}, (argv) => {
    require('./commands/ios')();
  })
  .command('android', 'Run Android app', {}, (argv) => {
    require('./commands/android')();
  })
  .command('version', 'Show version', {}, (argv) => {
    require('./commands/version')();
  })
  .demandCommand(1, 'You need to specify a command')
  .help()
  .argv;
