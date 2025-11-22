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
    const distDir = require('path').join(projectRoot, 'dist');

    // Get arguments from command line
    const args = Manager.getArguments();
    const simulator = args.simulator || args.s;

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
          cwd: distDir,
        });
      } catch (error) {
        logger.warn('Could not list simulators:', error.message);
      }

      logger.log('Running iOS app...');

      try {
        // Build command with optional simulator argument
        const rnCliPath = require('path').join(distDir, 'node_modules', '.bin', 'react-native');
        let command = `${rnCliPath} run-ios`;

        if (simulator) {
          command += ` --simulator="${simulator}"`;
          logger.log(`Using simulator: ${simulator}`);
        }

        execSync(command, {
          stdio: 'inherit',
          cwd: distDir,
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
