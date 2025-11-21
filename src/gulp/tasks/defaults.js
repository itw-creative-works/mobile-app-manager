const Manager = require('../../build.js');
const logger = Manager.logger('defaults');
const { watch, series } = require('gulp');
const jetpack = require('fs-jetpack');
const path = require('path');

const mainRoot = Manager.getRootPath('main');
const projectRoot = Manager.getRootPath('project');
const delay = 250;

// File mapping rules
const fileMapping = [
  {
    source: 'defaults/**/*',
    destination: '',
    overwrite: false,
  },
  {
    source: 'defaults/config/mobile-app-manager.json',
    destination: 'config',
    overwrite: true,
    merge: true,
  },
];

function defaults(complete) {
  logger.log('Starting...');

  const defaultsPath = path.join(mainRoot, 'dist', 'defaults');

  if (!jetpack.exists(defaultsPath)) {
    logger.warn('No defaults directory found');
    complete();
    return;
  }

  fileMapping.forEach((mapping) => {
    const sourcePath = path.join(mainRoot, 'dist', mapping.source);
    const isGlobPattern = mapping.source.includes('*');

    if (isGlobPattern) {
      // Handle glob patterns
      const baseDir = mapping.source.split('*')[0].replace(/\/$/, '');
      const basePath = path.join(mainRoot, 'dist', baseDir);

      if (!jetpack.exists(basePath)) {
        return;
      }

      const files = jetpack.find(basePath, {
        matching: mapping.source.replace(baseDir + '/', ''),
        files: true,
        directories: false,
      });

      files.forEach((file) => {
        const relativePath = path.relative(basePath, file);
        const destPath = path.join(projectRoot, mapping.destination, relativePath);

        if (!jetpack.exists(destPath) || mapping.overwrite) {
          jetpack.copy(file, destPath, { overwrite: mapping.overwrite });
        }
      });
    } else {
      // Handle specific files
      if (!jetpack.exists(sourcePath)) {
        return;
      }

      const filename = path.basename(sourcePath);
      const destPath = path.join(projectRoot, mapping.destination, filename);

      if (!jetpack.exists(destPath) || mapping.overwrite) {
        if (mapping.merge && jetpack.exists(destPath)) {
          // Merge JSON files
          try {
            const defaultConfig = jetpack.read(sourcePath, 'json');
            const existingConfig = jetpack.read(destPath, 'json');
            const merged = Object.assign({}, defaultConfig, existingConfig);
            jetpack.write(destPath, merged);
            logger.log(`Merged: ${mapping.destination}/${filename}`);
          } catch (error) {
            logger.error(`Failed to merge: ${mapping.destination}/${filename}`, error);
          }
        } else {
          jetpack.copy(sourcePath, destPath, { overwrite: mapping.overwrite });
        }
      }
    }
  });

  logger.log('Finished!');
  complete();
}

function defaultsWatcher(complete) {
  if (Manager.isBuildMode()) {
    logger.log('[watcher] Skipping watcher in build mode');
    return complete();
  }

  logger.log('[watcher] Watching for changes...');

  watch(
    path.join(mainRoot, 'dist', 'defaults', '**', '*'),
    { delay: delay, dot: true },
    defaults
  ).on('change', (path) => {
    logger.log(`[watcher] File changed (${path})`);
  });

  return complete();
}

module.exports = series(defaults, defaultsWatcher);
