// Libraries
const Manager = require('../build.js');
const logger = Manager.logger('install');
const { execute } = require('node-powertools');
const os = require('os');

// Load package
const package = Manager.getPackage('main');
const project = Manager.getPackage('project');

module.exports = async function (argv) {
  // Log
  logger.log(`Installing ${package.name}...`);

  // Get type from argv.type (the <type> parameter from yargs)
  const type = argv.type || 'prod';

  try {
    // Install production
    if (['prod', 'p', 'production'].includes(type)) {
      // Log
      logger.log('Installing production...');

      // Install
      await install(`npm uninstall ${package.name}`);
      await install(`npm install ${package.name}@latest --save-dev`);

      // Return
      return logger.log('Production installation complete.');
    }

    // Install development
    if (['dev', 'd', 'development', 'local', 'l'].includes(type)) {
      // Log
      logger.log('Installing development...');

      // Install
      await install(`npm uninstall ${package.name}`);
      await install(`npm install ${os.homedir()}/Developer/Repositories/ITW-Creative-Works/${package.name} --save-dev`);

      // Return
      return logger.log('Development installation complete.');
    }

  } catch (e) {
    logger.error(`Error during install:`, e);
  }
};

function install(command) {
  return execute(command, { log: true });
}
