const Manager = require('../../build.js');
const logger = Manager.logger('assets');
const { src, dest, watch, series } = require('gulp');
const path = require('path');
const jetpack = require('fs-jetpack');

const projectRoot = Manager.getRootPath('project');
const delay = 250;

function assets(complete) {
  logger.log('Starting...');

  const srcPaths = [
    path.join(projectRoot, 'src', 'assets', 'images', '**', '*'),
    path.join(projectRoot, 'src', 'assets', 'fonts', '**', '*'),
  ];

  // Filter to only existing directories
  const existingPaths = srcPaths.filter((srcPath) => {
    const dir = srcPath.split('**')[0];
    return jetpack.exists(dir);
  });

  if (existingPaths.length === 0) {
    logger.log('No asset directories found, skipping...');
    complete();
    return;
  }

  return src(existingPaths, { allowEmpty: true })
    .pipe(dest(path.join(projectRoot, 'dist', 'assets')))
    .on('finish', () => {
      logger.log('Finished!');
      return complete();
    });
}

function assetsWatcher(complete) {
  if (Manager.isBuildMode()) {
    logger.log('[watcher] Skipping watcher in build mode');
    return complete();
  }

  logger.log('[watcher] Watching for changes...');

  watch(
    [
      path.join(projectRoot, 'src', 'assets', 'images', '**', '*'),
      path.join(projectRoot, 'src', 'assets', 'fonts', '**', '*'),
    ],
    { delay: delay, dot: true },
    assets
  ).on('change', (path) => {
    logger.log(`[watcher] File changed (${path})`);
  });

  return complete();
}

module.exports = series(assets, assetsWatcher);
