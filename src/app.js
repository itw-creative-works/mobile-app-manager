const Manager = require('./build');

class App {
  constructor(options) {
    this.options = options || {};
    this.logger = Manager.logger('app');
  }

  async initialize() {
    this.logger.info('Initializing app...');

    const config = Manager.getConfig();
    const appConfig = Manager.getAppConfig();
    const environment = Manager.getEnvironment();

    this.logger.info(`Environment: ${environment}`);
    this.logger.info('App config:', appConfig);
    this.logger.info('Manager config:', config);

    return this;
  }

  getConfig() {
    return Manager.getConfig();
  }

  getAppConfig() {
    return Manager.getAppConfig();
  }

  getEnvironment() {
    return Manager.getEnvironment();
  }
}

module.exports = App;
