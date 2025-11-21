const { spawn, execSync } = require('child_process');
const Manager = require('../build');

module.exports = function () {
  const logger = Manager.logger('ios');

  if (!Manager.isIOS()) {
    logger.error('iOS development is only supported on macOS');
    process.exit(1);
  }

  logger.log('Starting build process and iOS app...');

  try {
    const projectRoot = Manager.getRootPath('project');
    const srcDir = require('path').join(projectRoot, 'src');

    // Start gulp build process in background
    logger.log('Starting gulp build process...');
    const gulpProcess = spawn('npm', ['run', 'gulp', '--'], {
      cwd: projectRoot,
      stdio: 'inherit',
      detached: false,
    });

    // Wait a moment for initial build to complete
    setTimeout(() => {
      // Check available simulators first
      logger.log('Checking available iOS simulators...');
      try {
        execSync('xcrun simctl list devices available', {
          stdio: 'inherit',
          cwd: srcDir,
        });
      } catch (error) {
        logger.warn('Could not list simulators:', error.message);
      }

      logger.log('Running iOS app...');

      try {
        // Run React Native iOS from src directory
        execSync('npx react-native run-ios', {
          stdio: 'inherit',
          cwd: srcDir,
        });
      } catch (error) {
        logger.error('Failed to run iOS app:', error);
        gulpProcess.kill();
        process.exit(1);
      }
    }, 2000);

    // Handle process termination
    process.on('SIGINT', () => {
      logger.log('Shutting down...');
      gulpProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start:', error);
    process.exit(1);
  }
};
