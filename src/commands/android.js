const { spawn, execSync } = require('child_process');
const Manager = require('../build');

module.exports = function () {
  const logger = Manager.logger('android');

  logger.log('Starting build process and Android app...');

  try {
    const projectRoot = Manager.getRootPath('project');
    const distDir = require('path').join(projectRoot, 'dist');

    // Start gulp build process in background
    logger.log('Starting gulp build process...');
    const gulpProcess = spawn('npm', ['run', 'gulp', '--'], {
      cwd: projectRoot,
      stdio: 'inherit',
      detached: false,
    });

    // Wait a moment for initial build to complete
    setTimeout(() => {
      logger.log('Running Android app...');

      try {
        // Run React Native Android using the CLI from dist/node_modules
        const rnCliPath = require('path').join(distDir, 'node_modules', '.bin', 'react-native');
        execSync(`${rnCliPath} run-android`, {
          stdio: 'inherit',
          cwd: distDir,
        });
      } catch (error) {
        logger.error('Failed to run Android app:', error);
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
