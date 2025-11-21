const jetpack = require('fs-jetpack');
const path = require('path');
const Manager = require('../build');

module.exports = function () {
  const logger = Manager.logger('clean');
  const projectRoot = Manager.getRootPath('project');

  logger.info('Cleaning build artifacts...');

  const dirsToClean = [
    '.temp',
    'dist',
    'packaged',
    'ios/build',
    'android/app/build',
    'android/build',
  ];

  dirsToClean.forEach((dir) => {
    const fullPath = path.join(projectRoot, dir);
    if (jetpack.exists(fullPath)) {
      logger.info(`Removing: ${dir}`);
      jetpack.remove(fullPath);
    }
  });

  // Recreate empty directories
  const dirsToRecreate = ['.temp', 'dist', 'packaged'];

  dirsToRecreate.forEach((dir) => {
    const fullPath = path.join(projectRoot, dir);
    jetpack.dir(fullPath);
    logger.info(`Created: ${dir}`);
  });

  logger.info('Clean complete!');
};
