const Manager = require('../../build.js');
const logger = Manager.logger('distribute');
const { src, dest, watch, series } = require('gulp');
const jetpack = require('fs-jetpack');
const path = require('path');
const { execSync } = require('child_process');

// Glob
const input = [
  // Files to include
  'src/**/*',

  // Files to exclude
  // Images handled by imagemin
  // '!src/**/*.{jpg,jpeg,png,gif,svg,webp}',
  // Exclude .DS_Store files
  '!**/.DS_Store',
];
const output = 'dist';
const delay = 250;

function distribute() {
  return new Promise(async function(resolve) {
    logger.log('Starting...');

    // Copy src files to dist
    return src(input, {
      base: 'src',
      dot: true,
      encoding: false
    })
      .pipe(dest(output, { encoding: false }))
      .on('finish', () => {
        logger.log('Finished!');
        return resolve();
      });
  });
}

function syncDependenciesToDist() {
  return new Promise((resolve) => {
    const projectRoot = Manager.getRootPath('project');
    const projectPackageJsonPath = path.join(projectRoot, 'package.json');
    const distPackageJsonPath = path.join(projectRoot, 'dist', 'package.json');

    if (!jetpack.exists(distPackageJsonPath)) {
      logger.warn('dist/package.json not found, skipping dependency sync');
      return resolve();
    }

    const projectPackage = jetpack.read(projectPackageJsonPath, 'json');
    const distPackage = jetpack.read(distPackageJsonPath, 'json');

    // Ensure dist package has dependencies and devDependencies objects
    distPackage.dependencies = distPackage.dependencies || {};
    distPackage.devDependencies = distPackage.devDependencies || {};

    // Get MAM's package.json to read peerDependencies
    const mainPackage = Manager.getPackage('main');
    const mamPeerDeps = Object.keys(mainPackage.peerDependencies || {});

    // Dependencies to ignore: mobile-app-manager itself + all its peerDependencies
    const depsToIgnore = ['mobile-app-manager', ...mamPeerDeps];

    // Get dependencies from project package.json
    const projectDeps = projectPackage.dependencies || {};
    const projectDevDeps = projectPackage.devDependencies || {};

    // Track changes
    let hasChanges = false;
    const newDeps = [];

    // Sync dependencies
    Object.keys(projectDeps).forEach((dep) => {
      // Skip ignored dependencies
      if (depsToIgnore.includes(dep)) {
        return;
      }

      // Add to dist if not already there or version changed
      if (!distPackage.dependencies[dep] || distPackage.dependencies[dep] !== projectDeps[dep]) {
        distPackage.dependencies[dep] = projectDeps[dep];
        newDeps.push(`${dep}@${projectDeps[dep]}`);
        hasChanges = true;
      }
    });

    // Sync devDependencies
    Object.keys(projectDevDeps).forEach((dep) => {
      // Skip ignored dependencies
      if (depsToIgnore.includes(dep)) {
        return;
      }

      // Add to dist if not already there or version changed
      if (!distPackage.devDependencies[dep] || distPackage.devDependencies[dep] !== projectDevDeps[dep]) {
        distPackage.devDependencies[dep] = projectDevDeps[dep];
        newDeps.push(`${dep}@${projectDevDeps[dep]} (dev)`);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      // Write updated package.json
      jetpack.write(distPackageJsonPath, distPackage);
      logger.log('Synced dependencies to dist/package.json');

      // Install new dependencies
      if (newDeps.length > 0) {
        logger.log('Installing new dependencies in dist:');
        newDeps.forEach(dep => logger.log(`  - ${dep}`));

        try {
          execSync('npm install', {
            stdio: 'inherit',
            cwd: path.join(projectRoot, 'dist'),
          });
        } catch (error) {
          logger.error('Failed to install dependencies in dist:', error);
        }
      }
    } else {
      logger.log('Dependencies already in sync');
    }

    return resolve({ hasChanges, newDepsInstalled: newDeps.length > 0 });
  });
}

function distributeWatcher(complete) {
  if (Manager.isBuildMode()) {
    logger.log('[watcher] Skipping watcher in build mode');
    return complete();
  }

  logger.log('[watcher] Watching for changes...');

  // Watch for changes in src files
  watch(input, { delay: delay, dot: true }, distribute)
  .on('change', function(path) {
    logger.log(`[watcher] File ${path} was changed`);
  });

  // Watch for changes in package.json
  watch('package.json', { delay: delay }, syncDependenciesToDist)
  .on('change', function(path) {
    logger.log(`[watcher] File ${path} was changed, syncing dependencies...`);
  });

  return complete();
}

module.exports = series(distribute, distributeWatcher);
module.exports.syncDependenciesToDist = syncDependenciesToDist;
