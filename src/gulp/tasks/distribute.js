const Manager = require('../../build.js');
const logger = Manager.logger('distribute');
const { series } = require('gulp');

function distribute(complete) {
  logger.log('Starting...');

  // Skip distribute - React Native manages the src directory
  logger.log('Skipping distribute (src managed by React Native)');
  logger.log('Finished!');
  complete();
}

function distributeWatcher(complete) {
  if (Manager.isBuildMode()) {
    logger.log('[watcher] Skipping watcher in build mode');
    return complete();
  }

  // No watcher needed - React Native manages src directory
  logger.log('[watcher] Skipping watcher (src managed by React Native)');
  return complete();
}

module.exports = series(distribute, distributeWatcher);
