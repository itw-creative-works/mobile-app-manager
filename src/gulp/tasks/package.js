const Manager = require('../../build.js');
const logger = Manager.logger('package');
const { watch, series } = require('gulp');
const jetpack = require('fs-jetpack');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = Manager.getRootPath('project');
const delay = 250;

// Set index
let index = -1;

async function packageTask(complete) {
  logger.log('Starting...');

  // Increment index
  index++;

  const config = Manager.getConfig();
  const appConfig = Manager.getAppConfig();
  const pkg = Manager.getPackage('project');

  // Create build metadata
  const buildMetadata = {
    version: pkg.version,
    buildTime: new Date().toISOString(),
    environment: Manager.getEnvironment(),
    config: config,
    appConfig: appConfig,
  };

  const buildJsonPath = path.join(projectRoot, 'dist', 'build.json');
  jetpack.write(buildJsonPath, buildMetadata);

  // Run build hooks
  const preHook = path.join(projectRoot, 'hooks', 'build:pre.js');
  if (jetpack.exists(preHook)) {
    try {
      const hook = require(preHook);
      await hook(index);
    } catch (error) {
      logger.error('Pre-build hook failed:', error);
    }
  }

  // Create packaged directory structure
  const packagedDir = path.join(projectRoot, 'packaged');
  const rawDir = path.join(packagedDir, 'raw');

  jetpack.dir(rawDir);

  // Copy dist to packaged/raw
  jetpack.copy(
    path.join(projectRoot, 'dist'),
    rawDir,
    { overwrite: true }
  );

  // Run post-build hook
  const postHook = path.join(projectRoot, 'hooks', 'build:post.js');
  if (jetpack.exists(postHook)) {
    try {
      const hook = require(postHook);
      await hook(index);
    } catch (error) {
      logger.error('Post-build hook failed:', error);
    }
  }

  // Note: For mobile apps, hot reload is handled by React Native Metro bundler
  // No need for WebSocket-based live reload like browser extensions

  // In build mode, create production package
  if (Manager.isBuildMode()) {
    // iOS build
    if (Manager.isIOS() && jetpack.exists(path.join(projectRoot, 'ios'))) {
      try {
        execSync('xcodebuild -workspace ios/*.xcworkspace -scheme YourApp -configuration Release', {
          cwd: projectRoot,
          stdio: 'inherit',
        });
      } catch (error) {
        logger.error('iOS build failed:', error);
      }
    }

    // Android build
    if (jetpack.exists(path.join(projectRoot, 'android'))) {
      try {
        execSync('cd android && ./gradlew assembleRelease', {
          cwd: projectRoot,
          stdio: 'inherit',
        });
      } catch (error) {
        logger.error('Android build failed:', error);
      }
    }
  }

  logger.log('Finished!');
  complete();
}

function packageWatcher(complete) {
  if (Manager.isBuildMode()) {
    logger.log('[watcher] Skipping watcher in build mode');
    return complete();
  }

  logger.log('[watcher] Watching for changes...');

  watch(
    [
      path.join(projectRoot, 'dist', '**', '*'),
      `!${path.join(projectRoot, 'dist', 'build.json')}`,
    ],
    { delay: delay, dot: true },
    packageTask
  ).on('change', (path) => {
    logger.log(`[watcher] File changed (${path})`);
  });

  return complete();
}

module.exports = series(packageTask, packageWatcher);
