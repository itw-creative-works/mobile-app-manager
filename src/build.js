const jetpack = require('fs-jetpack');
const path = require('path');

// Constants
const METRO_PORT = 8081;
const LIVE_RELOAD_PORT = 35729;

class Manager {
  constructor() {
    this.mainPackage = null;
    this.projectPackage = null;
    this.config = null;
    this.manifest = null;
    this._logger = null;
  }

  logger(name) {
    // Check if called as static method (this is not a Manager instance)
    if (!(this instanceof Manager)) {
      // For static calls, just return a new logger without caching
      return new (require('./lib/logger'))(name);
    }

    // For instance calls, cache the logger
    if (!this._logger) {
      this._logger = new (require('./lib/logger'))(name);
    }

    return this._logger;
  }

  getArguments() {
    const yargs = require('yargs/yargs');
    const { hideBin } = require('yargs/helpers');
    return yargs(hideBin(process.argv)).argv;
  }

  reportBuildError(error, callback) {
    const logger = this.logger('build-error');
    logger.error('Build error:', error);

    if (callback) {
      callback();
    }

    return this;
  }

  isBuildMode() {
    return process.env.MAM_BUILD_MODE === 'true';
  }

  actLikeProduction() {
    return this.isBuildMode();
  }

  getEnvironment() {
    return this.actLikeProduction() ? 'production' : 'development';
  }

  getAppConfig() {
    if (this.manifest) {
      return this.manifest;
    }

    const appJsonPath = path.join(process.cwd(), 'app.json');

    if (jetpack.exists(appJsonPath)) {
      this.manifest = jetpack.read(appJsonPath, 'json');
    } else {
      this.manifest = {};
    }

    return this.manifest;
  }

  getConfig() {
    if (this.config) {
      return this.config;
    }

    const configPath = path.join(process.cwd(), 'config', 'mobile-app-manager.json');

    if (jetpack.exists(configPath)) {
      this.config = jetpack.read(configPath, 'json');
    } else {
      this.config = {};
    }

    return this.config;
  }

  getPackage(type) {
    type = type || 'main';

    if (type === 'main') {
      if (this.mainPackage) {
        return this.mainPackage;
      }
      const mainPath = path.join(__dirname, '..', 'package.json');
      this.mainPackage = jetpack.read(mainPath, 'json');
      return this.mainPackage;
    } else if (type === 'project') {
      if (this.projectPackage) {
        return this.projectPackage;
      }
      const projectPath = path.join(process.cwd(), 'package.json');
      this.projectPackage = jetpack.read(projectPath, 'json');
      return this.projectPackage;
    }

    return null;
  }

  getRootPath(type) {
    type = type || 'main';

    if (type === 'main') {
      return path.join(__dirname, '..');
    } else if (type === 'project') {
      return process.cwd();
    }

    return null;
  }

  getMetroPort() {
    return METRO_PORT;
  }

  getLiveReloadPort() {
    return LIVE_RELOAD_PORT;
  }

  triggerRebuild(files) {
    const now = new Date();

    files = Array.isArray(files) ? files : [files];

    files.forEach((file) => {
      if (jetpack.exists(file)) {
        jetpack.file(file, { mode: '666' });
        const fd = require('fs').openSync(file, 'a');
        require('fs').futimesSync(fd, now, now);
        require('fs').closeSync(fd);
      }
    });

    return this;
  }

  getMemoryUsage() {
    const used = process.memoryUsage();
    const output = {};

    for (const key in used) {
      output[key] = `${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`;
    }

    return output;
  }

  logMemory(logger, label) {
    logger = logger || this.logger('memory');
    label = label || 'Memory usage';

    const usage = this.getMemoryUsage();
    logger.info(`${label}:`, usage);

    return this;
  }

  getPlatform() {
    return process.platform;
  }

  isIOS() {
    return this.getPlatform() === 'darwin';
  }

  isAndroid() {
    return true; // Android can be developed on any platform
  }
}

module.exports = new Manager();
