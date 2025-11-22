const jetpack = require('fs-jetpack');
const path = require('path');
const Manager = require('../build');

module.exports = function () {
  const logger = Manager.logger('clean');
  const projectRoot = Manager.getRootPath('project');

  logger.info('Cleaning build artifacts...');

  // DO NOT clean dist/ - React Native owns that directory
  logger.info('Skipping dist/ (managed by React Native)');

  // Clean other directories completely
  const dirsToClean = [
    '.temp',
    'packaged',
  ];

  dirsToClean.forEach((dir) => {
    const fullPath = path.join(projectRoot, dir);
    if (jetpack.exists(fullPath)) {
      logger.info(`Removing: ${dir}`);
      jetpack.remove(fullPath);
    }
  });

  // Recreate empty directories
  const dirsToRecreate = ['.temp', 'packaged'];

  dirsToRecreate.forEach((dir) => {
    const fullPath = path.join(projectRoot, dir);
    jetpack.dir(fullPath);
    logger.info(`Created: ${dir}`);
  });

  // Ensure dist exists (but don't clean it)
  const distDir = path.join(projectRoot, 'dist');
  if (!jetpack.exists(distDir)) {
    jetpack.dir(distDir);
    logger.info('Created: dist');
  }

  logger.info('Clean complete!');
};
