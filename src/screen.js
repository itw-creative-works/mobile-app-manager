const Manager = require('./build');

class Screen {
  constructor(options) {
    this.options = options || {};
    this.logger = Manager.logger('screen');
  }

  async initialize() {
    this.logger.info('Initializing screen...');

    return this;
  }

  getConfig() {
    return Manager.getConfig();
  }

  getEnvironment() {
    return Manager.getEnvironment();
  }
}

module.exports = Screen;
