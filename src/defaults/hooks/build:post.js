// Libraries
const Manager = require('mobile-app-manager/build');
const logger = Manager.logger('build:post');

// Hook
module.exports = async (index) => {
  logger.info('Running with index =', index);
};
